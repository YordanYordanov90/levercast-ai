# Plan: Loading States, Error Handling & Custom 404

## Current State

The project has **zero** loading, error, or not-found special Next.js files. Client components handle loading/error ad-hoc (e.g., `EditPostClient` shows plain text "Loading editor…"). API routes use a `jsonError()` helper but the client has no consistent error boundary pattern. No Skeleton UI component is installed via shadcn.

---

## Phase 1: Foundation — Skeleton Component

### 1.1 Install shadcn/ui Skeleton

```powershell
npx shadcn@latest add skeleton
```

This gives us `components/ui/skeleton.tsx` — a simple `div` with pulse animation that integrates with the existing theme system.

### 1.2 Create shared loading UI components

These are reusable React components used inside `loading.tsx` files.

| File | Purpose |
|------|---------|
| `components/loaders/DashboardSkeleton.tsx` | Skeleton layout matching dashboard stat cards + recent posts grid |
| `components/loaders/PostsSkeleton.tsx` | Skeleton layout matching the posts list/grid |
| `components/loaders/TemplatesSkeleton.tsx` | Skeleton layout matching templates list/grid |
| `components/loaders/EditorSkeleton.tsx` | Skeleton layout matching the post editor (two-column) |
| `components/loaders/PageSkeleton.tsx` | Generic page skeleton (title + content placeholders) |

Each skeleton mirrors the real page's grid structure so the transition from skeleton → real content feels seamless (no layout shift).

---

## Phase 2: Loading States (`loading.tsx`)

Next.js automatically shows `loading.tsx` while the route segment's server component is fetching data. These must be **server components** (default — no `'use client'`).

### 2.1 Files to create

| File | What it renders |
|------|-----------------|
| `app/loading.tsx` | Minimal spinner for the landing page (rarely seen — landing is static) |
| `app/(app)/loading.tsx` | `PageSkeleton` — fallback for any nested route |
| `app/(app)/dashboard/loading.tsx` | `DashboardSkeleton` |
| `app/(app)/posts/loading.tsx` | `PostsSkeleton` |
| `app/(app)/templates/loading.tsx` | `TemplatesSkeleton` |
| `app/(app)/edit-post/loading.tsx` | `EditorSkeleton` |
| `app/(app)/settings/loading.tsx` | `PageSkeleton` with settings section shapes |

### 2.2 Key details

- `app/(app)/loading.tsx` does **NOT** re-wrap inside `AppShell` — Next.js already renders the parent layout around the loading UI, so we just render the skeleton directly.
- The landing page `loading.tsx` can be minimal since the landing page is mostly static (no DB queries).
- `settings` is a client component with no data fetching, so its `loading.tsx` will flash quickly — still useful for the auth check (`ensureUser()` in the layout).

### 2.3 Remove inline Suspense fallback

Currently in `app/(app)/edit-post/page.tsx`:
```tsx
<Suspense fallback={<div className="p-8 text-muted-foreground text-sm">Loading editor…</div>}>
```
Update to use `EditorSkeleton` as the fallback.

---

## Phase 3: Error Boundaries (`error.tsx`)

`error.tsx` files are **client components** (`'use client'`) that catch React rendering errors in their segment. They receive `error` and `reset()` props.

### 3.1 Create shared error display component

| File | Purpose |
|------|---------|
| `components/error/ErrorDisplay.tsx` | Reusable error display with icon, message, and "Try again" button |

Props:
- `title?: string` — optional heading (defaults to "Something went wrong")
- `message: string` — error description
- `onRetry?: () => void` — optional retry handler
- `actionLabel?: string` — label for retry button (defaults to "Try again")

### 3.2 Files to create

| File | Scope |
|------|-------|
| `app/error.tsx` | Root error boundary — catches errors on the landing page and sign-in/up pages |
| `app/global-error.tsx` | Catches errors in the root layout itself (must render its own `<html>` / `<body>`) |
| `app/(app)/error.tsx` | Catches errors in any authenticated route (inside `AppShell`) |
| `app/(app)/dashboard/error.tsx` | Dashboard-specific — "Failed to load dashboard" with retry |
| `app/(app)/posts/error.tsx` | Posts page — "Failed to load posts" with retry |
| `app/(app)/templates/error.tsx` | Templates page — "Failed to load templates" with retry |
| `app/(app)/edit-post/error.tsx` | Editor — "Failed to load editor" with retry + "Back to posts" link |
| `app/(app)/settings/error.tsx` | Settings — "Failed to load settings" with retry |

### 3.3 Error boundary behavior

- **Auth errors (401/403):** Redirect to `/sign-in` via `router.push()` in `app/(app)/error.tsx`
- **Database/network errors:** Show `ErrorDisplay` with retry button
- **`global-error.tsx`:** Must render full `<html>` / `<body>` since the root layout crashed. Uses minimal inline styles (no Tailwind dependency) to ensure it renders even if CSS failed to load.

### 3.4 Client-side error handling

Current client components (`EditPostClient`, `PostsView`, `TemplatesView`) handle errors with `toast.error()`. This is fine for operational errors (save failed, delete failed). The inline error message in `EditPostClient` for load-time errors is a good pattern to keep. The `error.tsx` boundary acts as a safety net for unhandled render errors.

---

## Phase 4: Custom 404 Page (`not-found.tsx`)

### 4.1 Create custom not-found page

| File | Purpose |
|------|---------|
| `app/not-found.tsx` | Custom 404 page — matches Levercast's design |

### 4.2 Design

- Centered layout with Levercast's brand color (gold/orange `--primary`)
- Large "404" heading with `gradient-text` utility class
- "Page not found" subheading
- Brief description: "The page you're looking for doesn't exist or has been moved."
- Two CTAs:
  - **Primary**: "Go to Dashboard" → `/dashboard`
  - **Outline**: "Go Home" → `/`
- Uses existing animations: `animate-fade-in`, `animate-slide-up`
- Server component (no `'use client'`)

### 4.3 Auth route not-found redirects

| File | Purpose |
|------|---------|
| `app/sign-in/[[...sign-in]]/not-found.tsx` | Redirects to `/sign-in` base |
| `app/sign-up/[[...sign-up]]/not-found.tsx` | Redirects to `/sign-up` base |

These catch invalid sub-paths under Clerk's catch-all routes.

---

## Phase 5: Cleanup & Enhancements

### 5.1 Update `EditPostClient` inline loading

The `if (loading)` block in `EditPostClient` currently renders plain text. Replace it with the `EditorSkeleton` component so client-side loading (after navigation within the editor) also looks polished.

### 5.2 Update `edit-post/page.tsx` Suspense fallback

Current:
```tsx
<Suspense fallback={<div className="p-8 ...">Loading editor…</div>}>
```
Update to:
```tsx
<Suspense fallback={<EditorSkeleton />}>
```

---

## Implementation Order

| Step | Files | Depends on |
|------|-------|------------|
| 1 | Install `components/ui/skeleton.tsx` via shadcn | — |
| 2 | `components/loaders/*.tsx` (5 skeleton components) | Step 1 |
| 3 | `components/error/ErrorDisplay.tsx` | — |
| 4 | `app/not-found.tsx` | — |
| 5 | `app/global-error.tsx` | Step 3 |
| 6 | `app/error.tsx` | Step 3 |
| 7 | `app/(app)/error.tsx` | Step 3 |
| 8 | `app/loading.tsx` | Step 2 |
| 9 | `app/(app)/loading.tsx` | Step 2 |
| 10 | `app/(app)/dashboard/loading.tsx` | Step 2 |
| 11 | `app/(app)/posts/loading.tsx` | Step 2 |
| 12 | `app/(app)/templates/loading.tsx` | Step 2 |
| 13 | `app/(app)/edit-post/loading.tsx` | Step 2 |
| 14 | `app/(app)/settings/loading.tsx` | Step 2 |
| 15 | `app/(app)/dashboard/error.tsx` | Step 3 |
| 16 | `app/(app)/posts/error.tsx` | Step 3 |
| 17 | `app/(app)/templates/error.tsx` | Step 3 |
| 18 | `app/(app)/edit-post/error.tsx` | Step 3 |
| 19 | `app/(app)/settings/error.tsx` | Step 3 |
| 20 | Update `EditPostClient` loading state | Step 2 |
| 21 | Update `edit-post/page.tsx` Suspense fallback | Step 2 |
| 22 | Auth route not-found redirects | — |
| 23 | Build & verify all routes | All |

---

## Files Summary

### New files (25)

```
components/ui/skeleton.tsx                         (shadcn generated)
components/loaders/DashboardSkeleton.tsx
components/loaders/PostsSkeleton.tsx
components/loaders/TemplatesSkeleton.tsx
components/loaders/EditorSkeleton.tsx
components/loaders/PageSkeleton.tsx
components/error/ErrorDisplay.tsx
app/not-found.tsx
app/global-error.tsx
app/error.tsx
app/loading.tsx
app/(app)/loading.tsx
app/(app)/error.tsx
app/(app)/dashboard/loading.tsx
app/(app)/dashboard/error.tsx
app/(app)/posts/loading.tsx
app/(app)/posts/error.tsx
app/(app)/templates/loading.tsx
app/(app)/templates/error.tsx
app/(app)/edit-post/loading.tsx
app/(app)/edit-post/error.tsx
app/(app)/settings/loading.tsx
app/(app)/settings/error.tsx
app/sign-in/[[...sign-in]]/not-found.tsx
app/sign-up/[[...sign-up]]/not-found.tsx
```

### Modified files (2)

```
app/(app)/edit-post/page.tsx                       (update Suspense fallback)
app/(app)/edit-post/EditPostClient.tsx              (use EditorSkeleton for loading state)
```

---

## Design Decisions

1. **Skeletons over spinners** — Skeletons match the layout of real content, preventing CLS and feeling faster. Spinners say "wait" while skeletons say "content is almost here."

2. **Per-page `error.tsx` + catch-all layout `error.tsx`** — Layout-level (`app/(app)/error.tsx`) catches anything not handled. Per-page ones offer context-specific actions ("Back to posts", "Back to dashboard").

3. **`global-error.tsx` is essential** — Without it, an unhandled error in the root layout crashes the entire page with Next.js's default error UI. This must render its own `<html>` / `<body>` and use inline styles (Tailwind may not be available).

4. **Auth redirect in error boundary** — If `ensureUser()` throws because the session is invalid, `app/(app)/error.tsx` should detect this and redirect to sign-in rather than showing a generic error.

5. **`not-found.tsx` is a server component** — No client-side logic needed for the 404 page. Just static content with links.