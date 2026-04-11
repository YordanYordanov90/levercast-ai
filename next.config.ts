import type { NextConfig } from "next";

function imageRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    { protocol: "https", hostname: "img.clerk.com", pathname: "/**" },
    { protocol: "https", hostname: "images.clerk.dev", pathname: "/**" },
  ];
  const base = process.env.R2_PUBLIC_BASE_URL?.trim();
  if (base) {
    try {
      const host = new URL(base).hostname;
      if (host) {
        patterns.push({ protocol: "https", hostname: host, pathname: "/**" });
      }
    } catch {
      /* invalid URL in env */
    }
  }
  if (process.env.NODE_ENV !== "production") {
    patterns.push(
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
    );
  }
  return patterns;
}

const securityHeaders: { key: string; value: string }[] = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

if (process.env.NODE_ENV === "production") {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imageRemotePatterns(),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
