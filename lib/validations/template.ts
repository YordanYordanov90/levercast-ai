import { z } from "zod";

import { MAX_LIST_LIMIT } from "@/lib/validations/post";

export const templateListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_LIST_LIMIT).optional(),
  offset: z.coerce.number().int().min(0).max(500_000).optional(),
});

export type TemplateListQuery = z.infer<typeof templateListQuerySchema>;

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
