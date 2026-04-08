import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { clerkProfileFromWebhookUser, upsertClerkUserProfile } from "@/lib/db/clerk-user";

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("[clerk webhook] verify failed:", err instanceof Error ? err.message : err);
    return new Response("invalid signature", { status: 400 });
  }

  try {
    if (evt.type === "user.created" || evt.type === "user.updated") {
      await upsertClerkUserProfile(clerkProfileFromWebhookUser(evt.data));
      return new Response("ok", { status: 200 });
    }

    if (evt.type === "user.deleted") {
      if (!evt.data?.id) return new Response("ok", { status: 200 });
      await db.delete(users).where(eq(users.clerkId, evt.data.id));
      return new Response("ok", { status: 200 });
    }

    return new Response("ignored", { status: 200 });
  } catch (err) {
    console.error("[clerk webhook] handler error:", err instanceof Error ? err.message : err);
    return new Response("server error", { status: 500 });
  }
}
