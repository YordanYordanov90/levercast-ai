import { z } from "zod";

export const postStatusSchema = z.enum(["draft", "pending", "published"]);

export const formattedContentSchema = z
  .object({
    linkedin: z.string().max(50_000).optional(),
    twitter: z.string().max(50_000).optional(),
  })
  .strict();

/** HTTPS URL or small data-URI preview (not persisted long-term without blob storage). */
const imageUrlSchema = z
  .string()
  .max(600_000)
  .refine(
    (s) =>
      s.startsWith("https://") ||
      s.startsWith("http://localhost") ||
      /^data:image\/[a-zA-Z+.-]+;base64,/.test(s),
    { message: "imageUrl must be https, localhost, or a data:image base64 URI" },
  );

export const createPostSchema = z.object({
  title: z.string().max(500).optional().nullable(),
  rawContent: z.string().min(1).max(100_000),
  formattedContent: formattedContentSchema.optional(),
  imageUrl: imageUrlSchema.optional().nullable(),
  status: postStatusSchema.optional(),
});

export const patchPostSchema = createPostSchema.partial();

export const postListQuerySchema = z.object({
  status: postStatusSchema.optional(),
});

/** Body for POST /api/posts/[id]/publish — persists post + LinkedIn UGC when requested. */
export const publishPostBodySchema = z.object({
  title: z.string().max(500).optional().nullable(),
  rawContent: z.string().min(1).max(100_000),
  formattedContent: formattedContentSchema,
  imageUrl: imageUrlSchema.optional().nullable(),
  publishTo: z.array(z.enum(["linkedin", "twitter"])).min(1),
});
