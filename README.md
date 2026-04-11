# Levercast

AI-powered content creation for entrepreneurs: turn rough ideas into polished **LinkedIn** and **X (Twitter)** posts, preview and edit them, then publish from one place.

## Features

- **AI generation** — Draft posts and reusable templates with OpenAI via the Vercel AI SDK; usage limits on free tiers.
- **Social publishing** — Connect LinkedIn and X OAuth; publish drafts when integrations are connected.
- **Templates** — System and user-defined templates to steer tone and structure.
- **Media** — Image uploads via presigned URLs (Cloudflare R2–compatible storage).
- **Accounts & billing** — Clerk authentication; subscription state synced for plan-gated features.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js (App Router), React 19, TypeScript |
| UI | Tailwind CSS v4, shadcn-style Radix primitives |
| Auth | Clerk |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| AI | OpenAI (`@ai-sdk/openai`, `ai`) |
| Rate limiting | Upstash Redis |
| Object storage | S3-compatible (R2) |

Theme and design tokens live in `app/globals.css` (`@theme`); there is no `tailwind.config.js` (Tailwind v4).

## Prerequisites

- Node.js 20+ (matches `@types/node`)
- `npm` (or `pnpm` / `yarn` if you prefer)

## Setup

1. **Install dependencies**

   ```powershell
   npm install
   ```

2. **Environment variables** — Create a `.env.local` (or use your host’s secret manager) and set at least:

   **Core**

   - `DATABASE_URL` — Neon (or other Postgres) connection string
   - Clerk keys from the [Clerk dashboard](https://dashboard.clerk.com/) (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and related URLs if you customize them)

   **AI**

   - `OPENAI_API_KEY`

   **OAuth (optional for local dev until you test publish flows)**

   - LinkedIn: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`
   - X: `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`, `TWITTER_REDIRECT_URI`
   - `OAUTH_TOKEN_ENCRYPTION_KEY` — secret used to encrypt stored tokens at rest

   **Storage (images)**

   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`

   **Rate limiting**

   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

   **Billing / plans (Clerk Billing)**

   - `NEXT_PUBLIC_CLERK_FREE_PLAN_KEY`, `NEXT_PUBLIC_CLERK_PRO_PLAN_KEY`, `NEXT_PUBLIC_CLERK_PRO_PLAN_ID` — align with your Clerk plan keys/IDs

   Webhook signing secrets for Clerk (and any other webhooks you enable) must match what you configure in each provider’s dashboard.

3. **Database**

   ```powershell
   npm run db:migrate
   ```

   Schema changes: edit `lib/db/schema.ts`, then `npm run db:generate` and commit the files under `drizzle/`. Use `drizzle-kit push` only for quick local experiments; production should run migrations.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (Webpack; see `package.json`) |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run db:generate` | Generate migrations from schema changes |

## Deploy

Designed for [Vercel](https://vercel.com): set the same environment variables, run `db:migrate` in your release process before the app serves traffic, and configure Clerk OAuth redirect URLs and webhook endpoints for your production domain.

## Contributing

Project conventions (security, Drizzle, Tailwind v4, API validation) are summarized in `AGENTS.md`. Do not commit secrets; run `npm run build` before proposing merges.
