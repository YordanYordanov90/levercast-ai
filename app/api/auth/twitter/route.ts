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

export async function GET(request: Request) {
  const user = await getDbUserOrNull();
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

