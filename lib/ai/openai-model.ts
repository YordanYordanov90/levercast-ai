import { createOpenAI } from "@ai-sdk/openai";

const MODEL_ID = "gpt-4o-mini" as const;

export function getOpenAiModel() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  const openai = createOpenAI({ apiKey });
  return openai(MODEL_ID);
}
