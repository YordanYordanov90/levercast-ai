import { auth } from "@clerk/nextjs/server";
import { eq, and, gte, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, aiUsage } from "@/lib/db/schema";

const FREE_TIER_MONTHLY_LIMIT = 10;

/**
 * Clerk assigns the default Free plan to every new user (see Clerk "Default plans").
 * Optional override if your Free plan key in Dashboard differs (e.g. `free_user`).
 */
const FREE_PLAN_KEY = process.env.NEXT_PUBLIC_CLERK_FREE_PLAN_KEY?.trim();

const KNOWN_FREE_PLAN_KEYS = new Set(
  ["free_user", "free", FREE_PLAN_KEY].filter((k): k is string => Boolean(k)),
);

/** Plan slug from Clerk Dashboard (e.g. `pro`). Webhook stores `plan.slug` in `subscription_plan_id`. */
const PRO_PLAN_SLUG = process.env.NEXT_PUBLIC_CLERK_PRO_PLAN_KEY?.trim();
/** Clerk Plan ID (`cplan_...`) if you key off id instead of slug. */
const PRO_PLAN_ID = process.env.NEXT_PUBLIC_CLERK_PRO_PLAN_ID?.trim();

/** True when DB `subscription_plan_id` matches the configured Pro plan (slug or id). Never true for Free keys. */
function storedPlanIsPro(stored: string | null): boolean {
  if (!stored) return false;
  if (KNOWN_FREE_PLAN_KEYS.has(stored)) return false;
  if (PRO_PLAN_SLUG && stored === PRO_PLAN_SLUG) return true;
  if (PRO_PLAN_ID && stored === PRO_PLAN_ID) return true;
  return stored === "pro_plan";
}

/** Keys to try with `auth().has({ plan })` — Dashboard **Key** is often `pro_plan`; slug may be `pro`. */
function proPlanKeysForHas(): string[] {
  const keys = new Set<string>();
  if (PRO_PLAN_SLUG) keys.add(PRO_PLAN_SLUG);
  if (PRO_PLAN_ID) keys.add(PRO_PLAN_ID);
  keys.add("pro_plan");
  keys.add("pro");
  return [...keys];
}

/**
 * Session claims include billing entitlements as soon as checkout/trial starts; webhooks can lag.
 * Using `has({ plan })` keeps Pro trial users off the Free-tier AI cap.
 */
async function sessionHasProPlan(clerkId: string): Promise<boolean> {
  const { userId, has, isAuthenticated } = await auth();
  if (!isAuthenticated || !userId || userId !== clerkId) return false;
  for (const plan of proPlanKeysForHas()) {
    try {
      if (has({ plan })) return true;
    } catch {
      /* try next candidate */
    }
  }
  return false;
}

export type SubscriptionTier = "free" | "pro";

export async function getUserSubscription(clerkId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: {
      id: true,
      subscriptionStatus: true,
      subscriptionPlanId: true,
    },
  });

  if (!user) return null;

  const dbSaysPro =
    storedPlanIsPro(user.subscriptionPlanId) &&
    (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing");

  const sessionSaysPro = await sessionHasProPlan(clerkId);

  const tier: SubscriptionTier = sessionSaysPro || dbSaysPro ? "pro" : "free";

  return {
    ...user,
    tier,
  };
}

export function isSubscriptionActive(status: string | null): boolean {
  return status === "active" || status === "trialing";
}

export async function getMonthlyAiUsage(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiUsage)
    .where(
      and(
        eq(aiUsage.userId, userId),
        gte(aiUsage.createdAt, startOfMonth),
        lt(aiUsage.createdAt, startOfNextMonth),
      ),
    );

  return result[0]?.count ?? 0;
}

export async function canGenerateAiPost(clerkId: string): Promise<{
  allowed: boolean;
  tier: SubscriptionTier;
  usageCount: number;
  limit: number;
  remaining: number;
}> {
  const subscription = await getUserSubscription(clerkId);

  if (!subscription) {
    return {
      allowed: false,
      tier: "free",
      usageCount: 0,
      limit: 0,
      remaining: 0,
    };
  }

  // Pro users have unlimited access
  if (subscription.tier === "pro") {
    return {
      allowed: true,
      tier: "pro",
      usageCount: 0,
      limit: Infinity,
      remaining: Infinity,
    };
  }

  // Free users have monthly limit
  const usageCount = await getMonthlyAiUsage(subscription.id);
  const remaining = FREE_TIER_MONTHLY_LIMIT - usageCount;

  return {
    allowed: remaining > 0,
    tier: "free",
    usageCount,
    limit: FREE_TIER_MONTHLY_LIMIT,
    remaining,
  };
}

export async function trackAiUsage(userId: string, type: "post_generation" | "template_generation") {
  await db.insert(aiUsage).values({
    userId,
    type,
  });
}
