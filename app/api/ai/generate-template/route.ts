import { generateObject } from "ai";
import { NextResponse } from "next/server";

import {
  buildTemplateGenerationSystemPrompt,
} from "@/lib/ai/prompts";
import { getOpenAiModel } from "@/lib/ai/openai-model";
import { getDbUserOrNull } from "@/lib/auth/api-user";
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

    return NextResponse.json({
      data: {
        name: object.name.trim(),
        description: object.description.trim(),
        category: object.category.trim(),
        prompt: object.prompt.trim(),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed";
    console.error("[ai/generate-template]", e);
    return jsonError(msg, 500);
  }
}
