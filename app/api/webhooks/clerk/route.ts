import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import {
  syncRowFromSubscriptionItemPayload,
  syncRowFromSubscriptionPayload,
  type BillingSyncRow,
} from "@/lib/billing/clerk-billing-webhook";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { clerkProfileFromWebhookUser, upsertClerkUserProfile } from "@/lib/db/clerk-user";

async function applyBillingSync(row: BillingSyncRow) {
  await db
    .update(users)
    .set({
      subscriptionStatus: row.subscriptionStatus,
      subscriptionPlanId: row.subscriptionPlanId,
    })
    .where(eq(users.clerkId, row.clerkUserId));
}

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

    // --- Clerk Billing (payloads: commerce_subscription / commerce_subscription_item) ---
    if (
      evt.type === "subscription.created" ||
      evt.type === "subscription.updated" ||
      evt.type === "subscription.active" ||
      evt.type === "subscription.pastDue"
    ) {
      const row = syncRowFromSubscriptionPayload(evt.data);
      if (row) {
        await applyBillingSync(row);
      } else {
        console.warn("[clerk webhook] subscription event: could not map payload", evt.type);
      }
      return new Response("ok", { status: 200 });
    }

    if (
      evt.type === "subscriptionItem.created" ||
      evt.type === "subscriptionItem.updated" ||
      evt.type === "subscriptionItem.active" ||
      evt.type === "subscriptionItem.upcoming" ||
      evt.type === "subscriptionItem.incomplete" ||
      evt.type === "subscriptionItem.freeTrialEnding"
    ) {
      const row = syncRowFromSubscriptionItemPayload(evt.data);
      if (row) await applyBillingSync(row);
      return new Response("ok", { status: 200 });
    }

    if (evt.type === "subscriptionItem.canceled" || evt.type === "subscriptionItem.ended") {
      const row = syncRowFromSubscriptionItemPayload(evt.data);
      if (row) await applyBillingSync(row);
      return new Response("ok", { status: 200 });
    }

    if (evt.type === "subscriptionItem.abandoned") {
      const row = syncRowFromSubscriptionItemPayload(evt.data);
      if (row) await applyBillingSync(row);
      return new Response("ok", { status: 200 });
    }

    if (evt.type === "subscriptionItem.pastDue") {
      const row = syncRowFromSubscriptionItemPayload(evt.data);
      if (row) await applyBillingSync(row);
      return new Response("ok", { status: 200 });
    }

    return new Response("ignored", { status: 200 });
  } catch (err) {
    console.error("[clerk webhook] handler error:", err instanceof Error ? err.message : err);
    return new Response("server error", { status: 500 });
  }
}
