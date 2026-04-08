import { z } from "zod";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const allowedImageContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageContentType = (typeof allowedImageContentTypes)[number];

export const presignPostBodySchema = z.object({
  contentType: z.enum(allowedImageContentTypes),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_IMAGE_BYTES),
});

export const MAX_POST_IMAGE_BYTES = MAX_IMAGE_BYTES;
