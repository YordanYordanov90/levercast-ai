import { generateObject } from "ai";
import { NextResponse } from "next/server";

import {
  buildPostGenerationSystemPrompt,
} from "@/lib/ai/prompts";
import { getOpenAiModel } from "@/lib/ai/openai-model";
import { getDbUserOrNull } from "@/lib/auth/api-user";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  canGenerateAiPost,
  trackAiUsage,
} from "@/lib/billing/subscription";
import {
  generatePostOutputSchema,
  generatePostRequestSchema,
} from "@/lib/validations/ai";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  const rl = await checkRateLimit("ai", user.id, {
    route: "/api/ai/generate-post",
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: rl.errorMessage ?? "Too many requests. Please slow down." },
      { status: rl.status ?? 429, headers: rl.headers },
    );
  }

  // Check subscription tier and usage limits
  const permission = await canGenerateAiPost(user.clerkId);
  if (!permission.allowed) {
    return NextResponse.json(
      {
        error: "AI generation limit reached",
        tier: permission.tier,
        usageCount: permission.usageCount,
        limit: permission.limit,
        remaining: permission.remaining,
        upgradeUrl: "/billing",
      },
      { status: 403, headers: rl.headers },
    );
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return jsonError("AI generation is not configured", 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = generatePostRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "Invalid body",
      400,
    );
  }

  const d = parsed.data;
  const userPromptParts = [
    d.title?.trim() ? `Title: ${d.title.trim()}` : null,
    `Raw content:\n${d.rawContent.trim()}`,
  ].filter(Boolean);

  try {
    const model = getOpenAiModel();
    const { object } = await generateObject({
      model,
      schema: generatePostOutputSchema,
      schemaName: "platform_posts",
      schemaDescription:
        "Formatted post text per social platform (linkedin and/or twitter).",
      system: buildPostGenerationSystemPrompt({
        platforms: d.platforms,
        templatePrompt: d.templatePrompt,
      }),
      prompt: userPromptParts.join("\n\n"),
    });

    const data: { linkedin?: string; twitter?: string } = {};
    if (d.platforms.includes("linkedin")) {
      const v = object.linkedin.trim();
      if (v) data.linkedin = v;
    }
    if (d.platforms.includes("twitter")) {
      const v = object.twitter.trim();
      if (v) data.twitter = v;
    }

    if (Object.keys(data).length === 0) {
      return jsonError("Model returned no content for the requested platforms", 502);
    }

    // Track usage for Free tier counting
    await trackAiUsage(user.id, "post_generation");

    return NextResponse.json({ data }, { headers: rl.headers });
  } catch (e) {
    console.error("[ai/generate-post]", e);
    return jsonError("Generation failed", 500);
  }
}
