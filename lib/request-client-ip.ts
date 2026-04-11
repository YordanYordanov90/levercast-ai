/**
 * Best-effort client IP for rate limiting (e.g. behind Vercel / proxies).
 * Prefer `x-vercel-forwarded-for` on Vercel — set by the platform, not spoofable by clients.
 * Falls back to `x-forwarded-for` / `x-real-ip` for other hosts (still spoofable if not behind a trusted proxy).
 */
export function getRequestClientIp(request: Request): string {
  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    const first = vercelForwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}
