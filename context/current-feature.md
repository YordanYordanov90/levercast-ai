# Codebase Audit — Full Findings (2026-04-11)

All issues found by universal scanner, grouped by severity. Each entry includes file, impact, and suggested fix.

---

## HIGH

**[HIGH-001] Raw `Error.message` exposed to clients across API routes**
- Files: `app/api/ai/generate-post/route.ts:111-114`, `app/api/ai/generate-template/route.ts:99-102`, `app/api/uploads/presign/route.ts:50-55`, `app/api/posts/[id]/publish/route.ts:125-162`, `app/api/auth/twitter/callback/route.ts:78-83`
- Why it matters: OpenAI, R2, LinkedIn/Twitter SDK errors often contain provider/network internals leaked to the client via JSON or redirect query params.
- Fix: Always return a generic message (`"Operation failed"`); log the real error server-side with `console.error`.

**[HIGH-002] `error.tsx` boundaries expose `error.message` to users**
- Files: `app/error.tsx:12`, `app/(app)/posts/error.tsx:13-15`, `app/(app)/dashboard/error.tsx:13-15`, `app/(app)/edit-post/error.tsx:16-18`, `app/(app)/settings/error.tsx:13-15`, `app/(app)/templates/error.tsx:13-15`
- Why it matters: Server errors can include internal paths, stack traces, or provider details rendered directly in the UI.
- Fix: Show a generic "Something went wrong" message; log `error.message` server-side only.

**[HIGH-003] Unbounded dashboard query — no `.limit()`**
- File: `app/(app)/dashboard/page.tsx:62-70`
- Why it matters: Loading all posts into memory degrades TTFB and spikes memory as accounts grow. Counts are computed in JS instead of SQL.
- Fix: Add `.limit()` for the display list; use SQL `count()` aggregate for stats.

**[HIGH-004] `mapSubscriptionContainerStatus` defaults unknown statuses to `"active"`**
- File: `lib/billing/clerk-billing-webhook.ts:45-64`
- Why it matters: Any new/unrecognized Clerk subscription status silently becomes `active`, granting unearned access.
- Fix: Default to `"canceled"` or `"unpaid"` for unknown values and log a warning.

**[HIGH-005] Webhook payloads cast without Zod validation**
- File: `lib/billing/clerk-billing-webhook.ts:76-81, 107-111`
- Why it matters: Malformed webhook JSON can produce wrong DB updates or runtime errors.
- Fix: Add Zod schemas to validate webhook payloads before processing.

**[HIGH-006] Missing DB indexes on `posts.user_id`, `templates.user_id`, `ai_usage(user_id, created_at)`**
- File: `lib/db/schema.ts:48-82`
- Why it matters: Queries filtered by user do sequential scans as data grows → latency and cost.
- Fix: Add Drizzle `.index()` on these columns and generate a migration.

**[HIGH-007] `<Link>` wraps entire PostCard including nested `<button>` elements**
- File: `components/posts/PostCard.tsx:63-141`
- Why it matters: Invalid HTML (interactive inside `<a>`), broken keyboard activation, poor assistive tech support.
- Fix: Use an overlay `<a>` pattern (absolute-positioned link covering the card); keep buttons outside the link hierarchy.

**[HIGH-008] Image upload drop zone is not keyboard accessible**
- File: `components/editor/ImageUpload.tsx:90-120`
- Why it matters: Keyboard-only users cannot reach or activate the file upload.
- Fix: Add `role="button"`, `tabIndex={0}`, and `onKeyDown` for Enter/Space to the drop zone div.

**[HIGH-009] Remove button in ImageUpload missing `type="button"`**
- File: `components/editor/ImageUpload.tsx:141-147`
- Why it matters: Default type is `submit`; if inside a `<form>`, this accidentally submits.
- Fix: Add `type="button"` to the remove `<button>`.

---

## MEDIUM

**[MED-001] Duplicate `ensureUser()` calls — layout + every child page**
- Files: `app/(app)/layout.tsx:9`, `app/(app)/posts/page.tsx:10`, `app/(app)/templates/page.tsx:10`, `app/(app)/settings/page.tsx:46`, `app/(app)/dashboard/page.tsx:60`, `app/(app)/edit-post/page.tsx:31`
- Why it matters: Redundant DB/session work per request (layout already ensures user).
- Fix: Remove `ensureUser()` from child pages; rely on the layout call only.

**[MED-002] Suspense wrapping non-suspending children**
- Files: `app/(app)/edit-post/page.tsx:46-57`, `app/(app)/settings/page.tsx:70-75`
- Why it matters: Fallbacks never show; misleading code structure.
- Fix: Remove unnecessary Suspense boundaries or convert children to async components.

**[MED-003] AI output schemas allow lengths exceeding publish limits**
- Files: `lib/validations/ai.ts:17-19` (twitter 500 vs publish 280), `lib/validations/ai.ts:17-18` (linkedin 4000 vs UGC helper 3000)
- Why it matters: AI can generate content that passes validation but fails at publish time.
- Fix: Align AI output limits with platform publish limits (280 twitter / 3000 linkedin).

**[MED-004] `getMonthlyAiUsage` uses local timezone month boundaries**
- File: `lib/billing/subscription.ts:91-107`
- Why it matters: Usage windows shift with server TZ; users near month boundaries see inconsistent counts.
- Fix: Use UTC-based `Date` methods (`getUTCMonth`, `getUTCFullYear`) for month boundary calculation.

**[MED-005] Rate limiting silently skipped in non-production when Upstash is unconfigured**
- File: `lib/rate-limit.ts:119-127`
- Why it matters: Preview/staging environments have zero application-level throttling.
- Fix: Log a clear warning when rate limiting is skipped, or provide a local in-memory fallback.

**[MED-006] `imageUrlSchema` allows any `https://` URL**
- File: `lib/validations/post.ts:24-38`
- Why it matters: Stored URLs can point to arbitrary origins (tracking pixels, abuse vectors).
- Fix: Restrict allowed origins to your R2/CDN domain(s).

**[MED-007] TemplatesView is 460+ lines with 3 modal flows, CRUD + AI + delete**
- File: `components/templates/TemplatesView.tsx:25-463`
- Why it matters: Hard to test and maintain; high regression risk on changes.
- Fix: Extract each modal flow (create, edit, delete) into its own component.

**[MED-008] Modals in TemplatesView lack Escape handler and focus trap**
- File: `components/templates/TemplatesView.tsx:272-459`
- Why it matters: Keyboard users can't dismiss modals; focus escapes behind the overlay.
- Fix: Add `onKeyDown` for Escape and use a focus trap (or native `<dialog>`).

**[MED-009] Mobile navbar lacks `aria-expanded` and Escape-to-close**
- File: `components/landing/navbar.tsx:96-150`
- Why it matters: Screen readers don't get open/closed state; keyboard users lack standard dismissal.
- Fix: Add `aria-expanded`, `aria-controls`, and Escape key handler to the mobile menu toggle.

**[MED-010] PostCard and TemplateCard overflow menus lack Escape handler**
- Files: `components/posts/PostCard.tsx:36-44`, `components/templates/TemplateCard.tsx:23-31`
- Why it matters: Keyboard users can't dismiss menus with Escape.
- Fix: Add `onKeyDown` for Escape to close the menu.

**[MED-011] `CheckoutButtonWrapper` is dead code — `planId` unused, returns `null`**
- File: `components/billing/CheckoutButtonWrapper.tsx:7-14`
- Why it matters: Confusing; suggests abandoned integration.
- Fix: Remove the file, or implement if still needed.

**[MED-012] LinkedInConnect and TwitterConnect are near-duplicates**
- Files: `components/settings/LinkedInConnect.tsx`, `components/settings/TwitterConnect.tsx`
- Why it matters: Bug risk when updating one but not the other.
- Fix: Extract a shared `SocialConnect` component parameterized by platform.

**[MED-013] `<label>Image (optional)</label>` has no `htmlFor` / associated `id`**
- File: `app/(app)/edit-post/EditPostClient.tsx:667-668`
- Why it matters: Screen readers and click-to-focus don't work on the label.
- Fix: Add `htmlFor` on the label pointing to the file input's `id`.

**[MED-014] Inline styles in billing page**
- File: `app/(app)/billing/page.tsx:128-158`
- Why it matters: Pushes styling outside Tailwind; harder to maintain.
- Fix: Use dynamic Tailwind width classes or CSS custom properties.

**[MED-015] Auth redirect in `error.tsx` uses loose substring matching**
- File: `app/(app)/error.tsx:21-29`
- Why it matters: Errors containing "clerk" or "auth" in their message redirect to sign-in, hiding the real error.
- Fix: Check error type/code rather than message substring.

**[MED-016] PostCard buttons missing `type="button"`**
- File: `components/posts/PostCard.tsx:85-115`
- Why it matters: Same accidental submit risk as HIGH-009 if card renders inside a `<form>`.
- Fix: Add `type="button"` to all action buttons.

**[MED-017] `handleDelete` inline function in PostsView re-created every render**
- File: `components/posts/PostsView.tsx:31-40`
- Why it matters: Causes unnecessary re-renders of every `PostCard` child.
- Fix: Wrap in `useCallback`.

---

## LOW

**[LOW-001] `setTimeout` in `scroll-reveal.tsx` IntersectionObserver not cleared on unmount**
- File: `components/landing/scroll-reveal.tsx:19-25`
- Why it matters: `setIsRevealed` can fire after unmount (React warning).
- Fix: Store timeout ref and clear in cleanup.

**[LOW-002] Avatar `alt=""` in Twitter/LinkedIn previews**
- Files: `components/previews/TwitterPreview.tsx:52-57`, `components/previews/LinkedInPreview.tsx:53-58`
- Why it matters: Screen reader users get less context than a short alt would provide.
- Fix: Use `alt={authorName}` instead of empty string.

**[LOW-003] Copyright shows 2025 instead of 2026**
- File: `components/landing/footer.tsx:65-66`
- Fix: Update year to 2026 (or use `new Date().getFullYear()`).

**[LOW-004] `return envelope.data as T` — response not validated**
- File: `lib/api/fetch-json.ts:33-42`
- Why it matters: Callers get illusory type safety; runtime shape could differ.
- Fix: Accept a Zod schema param and parse before returning.

**[LOW-005] `package.json` name is `"cursor-project"`**
- File: `package.json:2`
- Fix: Rename to `"levercast-ai"` to match the repo.

**[LOW-006] Template metadata from JSONB cast without per-element validation**
- File: `lib/mappers/template-mapper.ts:12-22`
- Why it matters: Corrupt DB rows surface invalid platform strings in the UI.
- Fix: Validate `platforms` array elements against the enum with Zod.

**[LOW-007] `dangerouslySetInnerHTML` in layout.tsx for theme script**
- File: `app/layout.tsx:40-45`
- Why it matters: Safe today (static string), but fragile — any future interpolation of user data becomes XSS.
- Fix: Add a comment documenting the safety invariant; consider `next/script` with `strategy="beforeInteractive"`.

**[LOW-008] Empty `<section className="hidden" />` in EditPostClient**
- File: `app/(app)/edit-post/EditPostClient.tsx:787`
- Fix: Remove the dead markup.

**[LOW-009] Scroll listener in FloatingCta calls `setVisible` on every scroll event**
- File: `components/landing/FloatingCta.tsx:26-40`
- Why it matters: Extra React state updates on scroll.
- Fix: Throttle the scroll handler or use IntersectionObserver.

**[LOW-010] `resolvedTheme as ToasterProps["theme"]` type assertion**
- File: `components/ui/sonner.tsx:12`
- Why it matters: Hides type drift if Sonner's theme union changes.
- Fix: Use a type guard or conditional mapping.

**[LOW-011] OAuth response JSON cast without Zod validation**
- Files: `lib/oauth/twitter.ts:110-133`, `lib/twitter/tweet.ts:23-24`
- Why it matters: Unexpected API response shapes slip past type checks.
- Fix: Add minimal Zod parsing for the fields you use.

**[LOW-012] `drizzle.config.ts` uses non-null assertion on `DATABASE_URL`**
- File: `drizzle.config.ts:9`
- Fix: Add an explicit check with a clear error message before using the value.

**[LOW-013] `tsconfig.json` has `skipLibCheck: true`**
- File: `tsconfig.json:7`
- Why it matters: Hides type incompatibilities in dependencies.
- Fix: Consider removing once dependency types stabilize (low priority).

---

## Previously Identified Quick Wins (from earlier scans)

These overlap with findings above but include specific implementation snippets:

1. **Return generic 500s from AI routes** → see HIGH-001
2. **Make image upload zone keyboard-accessible** → see HIGH-008
3. **Show image remove button on keyboard focus** → add `focus-visible:opacity-100` to `ImageUpload.tsx:141`
4. **Add progress semantics to AI usage bar** → `billing/page.tsx:127` — add `role="progressbar"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
5. **Add AI usage gate to `/api/ai/generate-template`** → add `canGenerateAiPost` check + `trackAiUsage` call
6. **Remove data-URI support from server-side `imageUrlSchema`** → see MED-006
7. **Delete unused `lib/mock-data.ts`** → dead code removal
8. **Add `max(280)` to Twitter content in `publishPostBodySchema`** → see MED-003
9. **Add HTTP security headers to `next.config.ts`** → `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`

---

## Feature: Work-friendly dark dashboard theme

### Goal
- Keep dashboard **dark-first** (no light flash).
- Improve readability and "work feel" via clearer hierarchy (background → surface → raised surface), stronger borders, and better muted text contrast.

### Scope
- Update theme tokens in `app/globals.css` (dark mode surface ladder, borders, muted text).
- Fix initial theme class application in `app/layout.tsx` to avoid flicker while respecting stored theme.
- Keep existing orange accent as primary action color.

### Out of scope (for now)
- Full redesign of each dashboard page layout.
- Reworking Clerk appearance to dynamically match theme.

### Test plan
- Start dev server; verify no light→dark flash on hard refresh.
- Check `Dashboard`, `New Post`, `Recent Posts`, `Templates` for clearer card/input separation.
- Run `npm run build`.
