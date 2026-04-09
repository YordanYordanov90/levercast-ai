import { generateObject } from "ai";
import { NextResponse } from "next/server";

import {
  buildPostGenerationSystemPrompt,
} from "@/lib/ai/prompts";
import { getOpenAiModel } from "@/lib/ai/openai-model";
import { getDbUserOrNull } from "@/lib/auth/api-user";
import { checkRateLimit } from "@/lib/rate-limit";
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

  const rl = await checkRateLimit("ai", user.id);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: rl.headers },
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

    return NextResponse.json({ data }, { headers: rl.headers });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    console.error("[ai/generate-post]", e);
    return jsonError(msg, 500);
  }
}
