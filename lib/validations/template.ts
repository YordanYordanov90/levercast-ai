import { z } from "zod";

export const templateMetadataSchema = z
  .object({
    description: z.string().max(2000).optional(),
    category: z.string().max(200).optional(),
    platforms: z.array(z.enum(["linkedin", "twitter"])).max(10).optional(),
  })
  .strict();

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  prompt: z.string().min(1).max(50_000),
  metadata: templateMetadataSchema.optional(),
});

export const patchTemplateSchema = createTemplateSchema.partial();
