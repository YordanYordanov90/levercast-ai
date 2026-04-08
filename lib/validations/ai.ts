import { z } from "zod";

export const aiPlatformSchema = z.enum(["linkedin", "twitter"]);

export const generatePostRequestSchema = z.object({
  rawContent: z.string().min(1).max(100_000),
  title: z.string().max(500).optional(),
  platforms: z.array(aiPlatformSchema).min(1).max(2).default(["linkedin", "twitter"]),
  /** When set, overrides the default formatting instructions (template prompt body). */
  templatePrompt: z.string().max(50_000).optional(),
});

/**
 * OpenAI structured outputs require every `properties` key to appear in `required`.
 * Both strings are always returned; use "" for platforms not requested (see API route + prompt).
 */
export const generatePostOutputSchema = z.object({
  linkedin: z.string().max(4000),
  twitter: z.string().max(500),
});

export const generateTemplateRequestSchema = z.object({
  description: z.string().min(1).max(5000),
  platforms: z
    .array(aiPlatformSchema)
    .min(1)
    .max(2)
    .optional()
    .default(["linkedin", "twitter"]),
});

/** AI-generated template body: short recipe with placeholders (manual templates can be longer via CRUD). */
export const generateTemplateOutputSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000),
  category: z.string().min(1).max(200),
  prompt: z.string().min(1).max(3500),
});
