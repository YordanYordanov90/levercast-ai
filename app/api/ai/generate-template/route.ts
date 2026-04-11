import { generateObject } from "ai";
import { NextResponse } from "next/server";

import {
  buildTemplateGenerationSystemPrompt,
} from "@/lib/ai/prompts";
import { getOpenAiModel } from "@/lib/ai/openai-model";
import { getDbUserOrNull } from "@/lib/auth/api-user";
import {
  canGenerateAiPost,
  trackAiUsage,
} from "@/lib/billing/subscription";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  generateTemplateOutputSchema,
  generateTemplateRequestSchema,
} from "@/lib/validations/ai";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  const rl = await checkRateLimit("ai", user.id, {
    route: "/api/ai/generate-template",
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: rl.errorMessage ?? "Too many requests. Please slow down." },
      { status: rl.status ?? 429, headers: rl.headers },
    );
  }

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

  const parsed = generateTemplateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "Invalid body",
      400,
    );
  }

  const d = parsed.data;
  const platforms = d.platforms ?? ["linkedin", "twitter"];

  try {
    const model = getOpenAiModel();
    const { object } = await generateObject({
      model,
      schema: generateTemplateOutputSchema,
      schemaName: "content_template",
      schemaDescription:
        "A reusable template: name, description, category, and LLM prompt body.",
      system: buildTemplateGenerationSystemPrompt({ platforms }),
      prompt: `User request:\n${d.description.trim()}`,
    });

    await trackAiUsage(user.id, "template_generation");

    return NextResponse.json(
      {
        data: {
          name: object.name.trim(),
          description: object.description.trim(),
          category: object.category.trim(),
          prompt: object.prompt.trim(),
        },
      },
      { headers: rl.headers },
    );
  } catch (e) {
    console.error("[ai/generate-template]", e);
    return jsonError("Generation failed", 500);
  }
}
