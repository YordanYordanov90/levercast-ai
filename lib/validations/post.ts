import { z } from "zod";

export const postStatusSchema = z.enum(["draft", "pending", "published"]);

/** Max rows per list request (GET /api/posts, GET /api/templates). */
export const MAX_LIST_LIMIT = 100;
export const DEFAULT_LIST_LIMIT = 50;

export const formattedContentSchema = z
  .object({
    linkedin: z.string().max(50_000).optional(),
    twitter: z.string().max(50_000).optional(),
  })
  .strict();

/** Stricter caps for publish: Twitter API rejects >280 chars. */
export const publishFormattedContentSchema = z
  .object({
    linkedin: z.string().max(50_000).optional(),
    twitter: z.string().max(280).optional(),
  })
  .strict();

const ALLOWED_IMAGE_HOSTS = new Set([
  ...(process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim() ? [new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL.trim()).host] : []),
  ...(process.env.R2_PUBLIC_URL?.trim() ? [new URL(process.env.R2_PUBLIC_URL.trim()).host] : []),
]);

function isAllowedPersistedImageUrl(s: string): boolean {
  try {
    const url = new URL(s);
    if (ALLOWED_IMAGE_HOSTS.size > 0) {
      return url.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.has(url.host);
    }
    if (url.protocol === 'https:') return true;
    if (process.env.NODE_ENV !== 'production' && url.protocol === 'http:' && url.hostname === 'localhost') {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/** HTTPS public URL only (R2). Data URIs are rejected — use presigned upload, not DB blobs. */
const imageUrlSchema = z
  .string()
  .max(2048)
  .refine(isAllowedPersistedImageUrl, {
    message:
      "imageUrl must be an https URL (http://localhost allowed in development only)",
  });

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
  limit: z.coerce.number().int().min(1).max(MAX_LIST_LIMIT).optional(),
  offset: z.coerce.number().int().min(0).max(500_000).optional(),
});

export function resolveListPagination(q: {
  limit?: number;
  offset?: number;
}): { limit: number; offset: number } {
  return {
    limit: q.limit ?? DEFAULT_LIST_LIMIT,
    offset: q.offset ?? 0,
  };
}

/** Body for POST /api/posts/[id]/publish — persists post + LinkedIn UGC when requested. */
export const publishPostBodySchema = z.object({
  title: z.string().max(500).optional().nullable(),
  rawContent: z.string().min(1).max(100_000),
  formattedContent: publishFormattedContentSchema,
  imageUrl: imageUrlSchema.optional().nullable(),
  publishTo: z.array(z.enum(["linkedin", "twitter"])).min(1),
});
