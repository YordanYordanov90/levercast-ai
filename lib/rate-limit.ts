import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const RATE_LIMIT_POLICIES = {
  ai: {
    limit: 5,
    window: "60 s",
    prefix: "ratelimit:ai",
  },
  postsWrite: {
    limit: 30,
    window: "60 s",
    prefix: "ratelimit:api:posts-write",
  },
  templatesWrite: {
    limit: 30,
    window: "60 s",
    prefix: "ratelimit:api:templates-write",
  },
  publish: {
    limit: 10,
    window: "60 s",
    prefix: "ratelimit:api:publish",
  },
  uploadPresign: {
    limit: 10,
    window: "60 s",
    prefix: "ratelimit:api:upload-presign",
  },
  oauthStart: {
    limit: 10,
    window: "10 m",
    prefix: "ratelimit:auth:oauth-start",
  },
} as const;

type LimiterKind = keyof typeof RATE_LIMIT_POLICIES;

interface CheckRateLimitOptions {
  route?: string;
}

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec?: number;
  headers: Record<string, string>;
  skipped: boolean;
  errorMessage?: string;
  status?: 429 | 503;
}

function getRedisOrNull(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function getResetMs(reset: unknown): number | null {
  if (typeof reset === "number" && Number.isFinite(reset)) return reset;
  if (reset instanceof Date) return reset.getTime();
  return null;
}

function buildHeaders(limit: number, remaining: number, resetMs: number | null): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
  };
  if (resetMs !== null) headers["X-RateLimit-Reset"] = String(resetMs);
  return headers;
}

function createLimiters(redis: Redis): Record<LimiterKind, Ratelimit> {
  const limiters = {} as Record<LimiterKind, Ratelimit>;

  for (const [kind, policy] of Object.entries(RATE_LIMIT_POLICIES) as [
    LimiterKind,
    (typeof RATE_LIMIT_POLICIES)[LimiterKind],
  ][]) {
    limiters[kind] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
      analytics: true,
      prefix: policy.prefix,
      ephemeralCache: new Map(),
    });
  }

  return limiters;
}

function getLimiters() {
  const g = globalThis as unknown as {
    __levercastRatelimit?: {
      redis: Redis | null;
      limiters: Record<LimiterKind, Ratelimit> | null;
      warnedMissingConfig: boolean;
    };
  };

  if (g.__levercastRatelimit) return g.__levercastRatelimit;

  const redis = getRedisOrNull();
  g.__levercastRatelimit = {
    redis,
    limiters: redis ? createLimiters(redis) : null,
    warnedMissingConfig: false,
  };
  return g.__levercastRatelimit;
}

export async function checkRateLimit(
  kind: LimiterKind,
  identifier: string,
  options?: CheckRateLimitOptions,
): Promise<RateLimitResult> {
  const state = getLimiters();
  if (!state.redis || !state.limiters) {
    if (process.env.NODE_ENV !== "production") {
      if (!state.warnedMissingConfig) {
        console.warn(
          "[rate-limit] Upstash Redis is not configured. Skipping rate limiting outside production.",
        );
        state.warnedMissingConfig = true;
      }
      return { ok: true, headers: {}, skipped: true };
    }

    console.error("[rate-limit] Missing Upstash configuration for protected route", {
      kind,
      route: options?.route ?? "unknown",
    });
    return {
      ok: false,
      headers: {},
      skipped: false,
      errorMessage: "Rate limiting is not configured",
      status: 503,
    };
  }

  const limiter = state.limiters[kind];
  const result = await limiter.limit(identifier);

  const resetMs = getResetMs((result as unknown as { reset?: unknown }).reset);
  const headers = buildHeaders(result.limit, result.remaining, resetMs);

  if (result.success) return { ok: true, headers, skipped: false };

  const retryAfterSec =
    resetMs === null ? 60 : Math.max(1, Math.ceil((resetMs - Date.now()) / 1000));

  console.warn("[rate-limit] Blocked request", {
    kind,
    route: options?.route ?? "unknown",
    retryAfterSec,
  });

  return {
    ok: false,
    retryAfterSec,
    headers: { ...headers, "Retry-After": String(retryAfterSec) },
    skipped: false,
    errorMessage: "Too many requests. Please slow down.",
    status: 429,
  };
}
