import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PricingTable } from "@clerk/nextjs";
import { Check, Sparkles, Zap } from "lucide-react";

import { getUserSubscription, canGenerateAiPost } from "@/lib/billing/subscription";

export default async function BillingPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const subscription = await getUserSubscription(user.id);
  const isPro = subscription?.tier === "pro";
  const permission = user.id ? await canGenerateAiPost(user.id) : null;

  const usagePercent = permission
    ? permission.tier === "pro"
      ? 0
      : Math.min((permission.usageCount / permission.limit) * 100, 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your plan, usage, and billing details.
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
            isPro
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-muted text-muted-foreground border border-border"
          }`}
        >
          {isPro ? <Zap className="size-4" /> : <Sparkles className="size-4" />}
          {isPro ? "Pro Plan" : "Free Plan"}
        </div>
      </div>

      {/* Current Plan & Usage */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Plan Overview Card */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Current Plan
          </h2>

          <div className="flex items-center gap-4">
            <div
              className={`flex size-12 items-center justify-center rounded-lg ${
                isPro ? "bg-primary/10" : "bg-muted"
              }`}
            >
              {isPro ? (
                <Zap className="size-6 text-primary" />
              ) : (
                <Sparkles className="size-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-lg font-bold">{isPro ? "Pro" : "Free"}</p>
              <p className="text-sm text-muted-foreground">
                {isPro
                  ? "Billed monthly — see table below for current rate"
                  : "$0 / month"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span
                className={`font-medium ${
                  subscription?.subscriptionStatus === "active" ||
                  subscription?.subscriptionStatus === "trialing" ||
                  (!subscription?.subscriptionStatus && !isPro)
                    ? "text-green-600 dark:text-green-400"
                    : "text-destructive"
                }`}
              >
                {subscription?.subscriptionStatus ?? (isPro ? "active" : "active")}
              </span>
            </div>
          </div>
        </div>

        {/* AI Usage Card */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            AI Generations
          </h2>

          {isPro ? (
            <div className="flex flex-col items-center justify-center py-4 gap-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Zap className="size-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-primary">Unlimited</p>
              <p className="text-xs text-muted-foreground">
                Generate as many posts as you need
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold">
                    {permission?.usageCount ?? 0}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {" "}
                    / {permission?.limit ?? 10} used
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {permission?.remaining ?? 0} remaining
                </span>
              </div>

              {/* Usage bar */}
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usagePercent >= 100
                      ? "bg-destructive"
                      : usagePercent >= 80
                        ? "bg-amber-500"
                        : "bg-primary"
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Resets at the start of each month
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Plan Comparison */}
      {!isPro && (
        <div className="rounded-xl border border-primary/30 bg-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Subtle glow */}
          <div
            className="absolute -top-20 -right-20 size-60 rounded-full pointer-events-none blur-[80px] opacity-30"
            style={{
              background:
                "radial-gradient(circle, oklch(0.72 0.19 45 / 0.15) 0%, transparent 70%)",
            }}
          />

          <div className="relative space-y-6">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                Upgrade
              </p>
              <h2 className="text-xl sm:text-2xl font-bold font-display">
                Do more with Pro
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Unlimited AI generations and premium features.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {/* Free */}
              <div className="rounded-lg border border-border p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Free</p>
                  <p className="text-2xl font-bold mt-1">
                    $0<span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {[
                    "10 AI posts / month",
                    "LinkedIn & Twitter",
                    "2 templates",
                    "Manual publish",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="size-3.5 shrink-0 text-muted-foreground/50" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro */}
              <div className="rounded-lg border border-primary/40 bg-primary/3 p-5 space-y-4 relative card-corner-accent">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  RECOMMENDED
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">Pro</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pricing shown in the table below
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {[
                    "Unlimited AI posts",
                    "All platforms",
                    "Unlimited templates",
                    "One-click publish",
                    "Post history & tracking",
                    "Priority support",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="size-3.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout / Manage Section */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {isPro ? "Manage Subscription" : "Upgrade to Pro"}
        </h2>

        {isPro ? (
          <p className="text-sm text-muted-foreground">
            You&apos;re on the Pro plan. Use the table below to manage your billing details or cancel.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a plan below to upgrade and unlock unlimited AI generations.
          </p>
        )}

        <PricingTable
          appearance={{
            elements: {
              root: "w-full",
            },
          }}
        />
      </div>
    </div>
  );
}
