import { z } from "zod";

/** LinkedIn OAuth callback query params (GET). */
export const linkedInCallbackQuerySchema = z
  .object({
    code: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
  })
  .strict();

export type LinkedInCallbackQuery = z.infer<typeof linkedInCallbackQuerySchema>;

/** Twitter/X OAuth callback query params (GET). */
export const twitterCallbackQuerySchema = z
  .object({
    code: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
  })
  .strict();

export type TwitterCallbackQuery = z.infer<typeof twitterCallbackQuerySchema>;
