import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

import { getDbUserOrNull } from "@/lib/auth/api-user";
import { LINKEDIN_OAUTH_STATE_COOKIE, LINKEDIN_OAUTH_STATE_MAX_AGE_SEC } from "@/lib/oauth/constants";
import { buildLinkedInAuthUrl } from "@/lib/oauth/linkedin";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestClientIp } from "@/lib/request-client-ip";

export async function GET(request: Request) {
  const user = await getDbUserOrNull();
  const rlKey = user ? user.id : `ip:${getRequestClientIp(request)}`;
  const rl = await checkRateLimit("oauthStart", rlKey, {
    route: "/api/auth/linkedin",
  });
  if (!rl.ok) {
    const path = user ? "/settings" : "/sign-in";
    const url = new URL(path, request.url);
    url.searchParams.set("error", user ? "linkedin_rate_limit" : "oauth_rate_limit");
    return NextResponse.redirect(url, { headers: rl.headers });
  }
  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const state = randomBytes(16).toString("hex");
  let authorizeUrl: string;
  try {
    authorizeUrl = buildLinkedInAuthUrl(state);
  } catch {
    return NextResponse.redirect(new URL("/settings?error=linkedin_config", request.url));
  }

  const res = NextResponse.redirect(authorizeUrl);
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set({
    name: LINKEDIN_OAUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: LINKEDIN_OAUTH_STATE_MAX_AGE_SEC,
  });
  return res;
}
