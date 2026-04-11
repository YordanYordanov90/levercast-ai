/**
 * Clerk Billing webhook payloads use nested commerce_* objects (see @clerk/backend JSON types),
 * not flat { user_id, plan_key }. This module maps them to DB fields.
 */

import { z } from "zod";

/** Matches `subscription_status` pgEnum in schema */
type SubscriptionStatus = "active" | "canceled" | "past_due" | "unpaid" | "trialing";

const billingPayerSchema = z.object({
  user_id: z.string().optional(),
});

const billingPlanRefSchema = z.object({
  slug: z.string().optional(),
  is_default: z.boolean().optional(),
});

const billingSubscriptionItemSchema = z.object({
  object: z.string(),
  status: z.string(),
  payer: billingPayerSchema.optional(),
  plan: billingPlanRefSchema.nullable().optional(),
  plan_id: z.string().nullable().optional(),
});

const billingSubscriptionPayloadSchema = z.object({
  object: z.string(),
  status: z.string(),
  payer: billingPayerSchema,
  items: z.array(billingSubscriptionItemSchema),
});

export const subscriptionPayloadSchema = billingSubscriptionPayloadSchema;
export const subscriptionItemPayloadSchema = billingSubscriptionItemSchema;

type BillingPayer = z.infer<typeof billingPayerSchema>;
type BillingPlanRef = z.infer<typeof billingPlanRefSchema>;
type BillingSubscriptionItemPayload = z.infer<typeof billingSubscriptionItemSchema>;
type BillingSubscriptionPayload = z.infer<typeof billingSubscriptionPayloadSchema>;

function planStorageKey(item: BillingSubscriptionItemPayload): string | null {
  const slug = item.plan?.slug?.trim();
  if (slug) return slug;
  const id = item.plan_id?.trim();
  if (id) return id;
  return null;
}

function pickPaidActiveItem(items: BillingSubscriptionItemPayload[]) {
  return items.find(
    (i) =>
      i.status === "active" &&
      i.plan &&
      i.plan.is_default !== true
  );
}

function mapSubscriptionContainerStatus(
  s: BillingSubscriptionPayload["status"]
): SubscriptionStatus {
  switch (s) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "ended":
    case "expired":
    case "abandoned":
      return "canceled";
    case "incomplete":
      return "unpaid";
    case "upcoming":
      return "trialing";
    default:
      console.warn(`[clerk-billing] Unknown subscription status: ${s}, defaulting to "canceled"`);
      return "canceled";
  }
}

export type BillingSyncRow = {
  clerkUserId: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlanId: string | null;
};

/**
 * Maps subscription.* webhook data to a users row update.
 */
export function syncRowFromSubscriptionPayload(
  data: unknown
): BillingSyncRow | null {
  const parsed = subscriptionPayloadSchema.safeParse(data);
  if (!parsed.success) {
    console.warn("[clerk-billing] Invalid subscription payload:", parsed.error.issues);
    return null;
  }
  const d = parsed.data;
  if (d.object !== "commerce_subscription") return null;

  const clerkUserId = d.payer.user_id?.trim();
  if (!clerkUserId) return null;

  const paid = pickPaidActiveItem(d.items ?? []);
  if (paid) {
    const planId = planStorageKey(paid);
    if (paid.status === "past_due") {
      return { clerkUserId, subscriptionStatus: "past_due", subscriptionPlanId: planId };
    }
    if (paid.status === "incomplete") {
      return { clerkUserId, subscriptionStatus: "unpaid", subscriptionPlanId: null };
    }
    return { clerkUserId, subscriptionStatus: "active", subscriptionPlanId: planId };
  }

  return {
    clerkUserId,
    subscriptionStatus: mapSubscriptionContainerStatus(d.status),
    subscriptionPlanId: null,
  };
}

/**
 * Maps subscriptionItem.* webhook data to a users row update.
 */
export function syncRowFromSubscriptionItemPayload(
  data: unknown
): BillingSyncRow | null {
  const parsed = subscriptionItemPayloadSchema.safeParse(data);
  if (!parsed.success) {
    console.warn("[clerk-billing] Invalid subscription item payload:", parsed.error.issues);
    return null;
  }
  const d = parsed.data;
  if (d.object !== "commerce_subscription_item") return null;

  const clerkUserId = d.payer?.user_id?.trim();
  if (!clerkUserId) return null;

  const isDefaultPlan = d.plan?.is_default === true;
  const planKey = planStorageKey(d);

  if (d.status === "past_due") {
    return { clerkUserId, subscriptionStatus: "past_due", subscriptionPlanId: planKey };
  }

  if (
    d.status === "ended" ||
    d.status === "abandoned" ||
    d.status === "canceled"
  ) {
    return { clerkUserId, subscriptionStatus: "canceled", subscriptionPlanId: null };
  }

  if (d.status === "incomplete") {
    return { clerkUserId, subscriptionStatus: "unpaid", subscriptionPlanId: null };
  }

  if (d.status === "upcoming" && planKey && !isDefaultPlan) {
    return { clerkUserId, subscriptionStatus: "active", subscriptionPlanId: planKey };
  }

  if (isDefaultPlan || !planKey) {
    return { clerkUserId, subscriptionStatus: "active", subscriptionPlanId: null };
  }

  return {
    clerkUserId,
    subscriptionStatus: "canceled",
    subscriptionPlanId: planKey,
  };
}
