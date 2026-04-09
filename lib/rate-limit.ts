import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type LimiterKind = "ai" | "api";

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec?: number;
  headers: Record<string, string>;
  skipped: boolean;
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

function getLimiters() {
  const g = globalThis as unknown as {
    __levercastRatelimit?: {
      redis: Redis | null;
      ai: Ratelimit;
      api: Ratelimit;
    };
  };

  if (g.__levercastRatelimit) return g.__levercastRatelimit;

  const redis = getRedisOrNull();
  const safeRedis = redis ?? new Redis({ url: "http://127.0.0.1", token: "missing" });

  const ai = new Ratelimit({
    redis: safeRedis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
    prefix: "ratelimit:ai",
    ephemeralCache: new Map(),
  });

  const api = new Ratelimit({
    redis: safeRedis,
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    analytics: true,
    prefix: "ratelimit:api",
    ephemeralCache: new Map(),
  });

  g.__levercastRatelimit = { redis, ai, api };
  return g.__levercastRatelimit;
}

export async function checkRateLimit(kind: LimiterKind, identifier: string): Promise<RateLimitResult> {
  const { redis, ai, api } = getLimiters();
  if (!redis) {
    return { ok: true, headers: {}, skipped: true };
  }

  const limiter = kind === "ai" ? ai : api;
  const result = await limiter.limit(identifier);

  const resetMs = getResetMs((result as unknown as { reset?: unknown }).reset);
  const headers = buildHeaders(result.limit, result.remaining, resetMs);

  if (result.success) return { ok: true, headers, skipped: false };

  const retryAfterSec =
    resetMs === null ? 60 : Math.max(1, Math.ceil((resetMs - Date.now()) / 1000));

  return {
    ok: false,
    retryAfterSec,
    headers: { ...headers, "Retry-After": String(retryAfterSec) },
    skipped: false,
  };
}
