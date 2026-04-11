import { NextResponse } from "next/server";

import { getDbUserOrNull } from "@/lib/auth/api-user";
import {
  TWITTER_OAUTH_CODE_VERIFIER_COOKIE,
  TWITTER_OAUTH_STATE_COOKIE,
  TWITTER_OAUTH_STATE_MAX_AGE_SEC,
} from "@/lib/oauth/constants";
import {
  buildTwitterAuthUrl,
  deriveTwitterCodeChallenge,
  generateTwitterCodeVerifier,
  generateTwitterOAuthState,
  hasTwitterOAuthConfig,
} from "@/lib/oauth/twitter";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestClientIp } from "@/lib/request-client-ip";

export async function GET(request: Request) {
  const user = await getDbUserOrNull();
  const rlKey = user ? user.id : `ip:${getRequestClientIp(request)}`;
  const rl = await checkRateLimit("oauthStart", rlKey, {
    route: "/api/auth/twitter",
  });
  if (!rl.ok) {
    const path = user ? "/settings" : "/sign-in";
    const url = new URL(path, request.url);
    url.searchParams.set("error", user ? "twitter_rate_limit" : "oauth_rate_limit");
    return NextResponse.redirect(url, { headers: rl.headers });
  }
  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!hasTwitterOAuthConfig()) {
    return NextResponse.redirect(new URL("/settings?error=twitter_config", request.url));
  }

  const state = generateTwitterOAuthState();
  const codeVerifier = generateTwitterCodeVerifier();
  const codeChallenge = deriveTwitterCodeChallenge(codeVerifier);

  const authorizeUrl = buildTwitterAuthUrl({ state, codeChallenge });

  const res = NextResponse.redirect(authorizeUrl);
  const isProd = process.env.NODE_ENV === "production";

  res.cookies.set({
    name: TWITTER_OAUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: TWITTER_OAUTH_STATE_MAX_AGE_SEC,
  });
  res.cookies.set({
    name: TWITTER_OAUTH_CODE_VERIFIER_COOKIE,
    value: codeVerifier,
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: TWITTER_OAUTH_STATE_MAX_AGE_SEC,
  });

  return res;
}

