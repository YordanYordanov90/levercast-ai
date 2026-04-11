/**
 * Clerk docs often use `/api/webhooks` as the example URL. Re-export so either
 * `/api/webhooks` or `/api/webhooks/clerk` works when registered in Dashboard.
 */
export { POST } from "./clerk/route";
