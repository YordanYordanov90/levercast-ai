# Current Fixes — HIGH Severity (2026-04-11)

Completed fixes from the codebase audit. See `current-feature.md` for full findings.

---

## HIGH-001 — Raw `Error.message` exposed to clients across API routes ✅

**Fix:** Replaced all `e instanceof Error ? e.message : "..."` patterns with generic messages (`"Generation failed"`, `"Upload failed"`, `"LinkedIn publish failed"`, `"Twitter / X publish failed"`). Added `console.error()` for server-side logging. Removed error detail leak from Twitter OAuth callback redirect URL.

**Files changed:**
- `app/api/ai/generate-post/route.ts` — generic `"Generation failed"` 500
- `app/api/ai/generate-template/route.ts` — generic `"Generation failed"` 500
- `app/api/uploads/presign/route.ts` — generic `"Upload failed"` 500; kept `"R2 is not configured"` check as server-side condition
- `app/api/posts/[id]/publish/route.ts` — generic error strings in `publishResults` error objects
- `app/api/auth/twitter/callback/route.ts` — removed `error.message` from redirect query params; logs server-side instead

---

## HIGH-002 — `error.tsx` boundaries expose `error.message` to users ✅

**Fix:** Replaced all `error.message` renders with static generic messages. Added `useEffect` + `console.error` for server-side logging of the real error.

**Files changed:**
- `app/error.tsx` — `"An unexpected error occurred."`
- `app/(app)/posts/error.tsx` — `"Could not load your posts. Please try again."`
- `app/(app)/dashboard/error.tsx` — `"Could not load your dashboard. Please try again."`
- `app/(app)/edit-post/error.tsx` — `"Could not load the editor. Please try again."`
- `app/(app)/settings/error.tsx` — `"Could not load settings. Please try again."`
- `app/(app)/templates/error.tsx` — `"Could not load your templates. Please try again."`

---

## HIGH-003 — Unbounded dashboard query — no `.limit()` ✅

**Fix:** Added `.limit(6)` to the recent posts query. Replaced JavaScript `.filter().length` counts with SQL `count()` queries per status (draft, pending, published) using `and()` + `eq()`. Removed `sql` import (unused).

**Files changed:**
- `app/(app)/dashboard/page.tsx` — 3 separate `count()` queries + `.limit(RECENT_POST_LIMIT)` on recent posts

---

## HIGH-004 — `mapSubscriptionContainerStatus` defaults unknown statuses to `"active"` ✅

**Fix:** Changed the `default` case in `mapSubscriptionContainerStatus` from `return "active"` to `return "canceled"` with a `console.warn`. Also changed the fallback return in `syncRowFromSubscriptionItemPayload` from `"active"` to `"canceled"`.

**Files changed:**
- `lib/billing/clerk-billing-webhook.ts` — default → `"canceled"` + `console.warn`

---

## HIGH-005 — Webhook payloads cast without Zod validation ✅

**Fix:** Added Zod schemas (`billingPayerSchema`, `billingPlanRefSchema`, `billingSubscriptionItemSchema`, `billingSubscriptionPayloadSchema`). Exported as `subscriptionPayloadSchema` and `subscriptionItemPayloadSchema`. Both `syncRowFromSubscriptionPayload` and `syncRowFromSubscriptionItemPayload` now call `.safeParse()` first — returning `null` and logging a warning if validation fails.

**Files changed:**
- `lib/billing/clerk-billing-webhook.ts` — added Zod schemas, replaced `data as T` casts with `.safeParse()`

---

## HIGH-006 — Missing DB indexes on `posts.user_id`, `templates.user_id`, `ai_usage(user_id, created_at)` ✅

**Fix:** Added `index` import from `drizzle-orm/pg-core`. Added `posts_user_id_idx`, `templates_user_id_idx`, `ai_usage_user_id_idx`, and `ai_usage_user_created_idx` via Drizzle table callbacks. Generated migration `0004_brief_arclight.sql`.

**Files changed:**
- `lib/db/schema.ts` — indexes on `posts.userId`, `templates.userId`, `ai_usage.userId`, `ai_usage(userId, createdAt)`
- `drizzle/0004_brief_arclight.sql` — new migration with `CREATE INDEX` statements

---

## HIGH-007 — `<Link>` wraps entire PostCard including nested `<button>` elements ✅

**Fix:** Replaced the `<Link>` that wrapped the card content with an overlay link pattern:
- Outer `<div>` becomes the card container with all styling
- `<Link>` gets `absolute inset-0 z-0` to cover the full card area
- Interactive content (buttons, menu) gets `relative z-10` to sit above the link
- Removed `e.preventDefault()` / `e.stopPropagation()` hacks from button handlers since buttons are no longer inside the link

**Files changed:**
- `components/posts/PostCard.tsx` — overlay link pattern, buttons outside link hierarchy

---

## HIGH-008 — Image upload drop zone not keyboard accessible ✅

**Fix:** Added `role="button"`, `tabIndex={0}`, `onKeyDown` handler (Enter/Space triggers click), and `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` styling to the drop zone div.

**Files changed:**
- `components/editor/ImageUpload.tsx`

---

## HIGH-009 — Remove button in ImageUpload missing `type="button"` ✅

**Fix:** Added `type="button"` to the remove `<button>`. Also added `focus-visible:opacity-100` and focus ring styling so the remove button is visible on keyboard focus.

**Files changed:**
- `components/editor/ImageUpload.tsx`

---

## Build Verification

- `npm run build` passes ✅
- `drizzle-kit generate` creates migration `0004_brief_arclight.sql` ✅