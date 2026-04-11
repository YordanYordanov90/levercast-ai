import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getDbUserOrNull } from "@/lib/auth/api-user";
import { upsertIntegration } from "@/lib/db/integrations";
import {
  TWITTER_OAUTH_CODE_VERIFIER_COOKIE,
  TWITTER_OAUTH_STATE_COOKIE,
} from "@/lib/oauth/constants";
import { encryptToken } from "@/lib/oauth/encrypt";
import { exchangeTwitterCodeForTokens, getTwitterUserInfo } from "@/lib/oauth/twitter";
import { twitterCallbackQuerySchema } from "@/lib/validations/integrations";

function redirectSettings(request: Request, search: string) {
  return NextResponse.redirect(new URL(`/settings${search}`, request.url));
}

function clearOAuthCookies(response: NextResponse) {
  const isProd = process.env.NODE_ENV === "production";
  for (const name of [TWITTER_OAUTH_STATE_COOKIE, TWITTER_OAUTH_CODE_VERIFIER_COOKIE]) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 0,
    });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = Object.fromEntries(searchParams.entries());
  const parsed = twitterCallbackQuerySchema.safeParse(raw);

  if (!parsed.success) {
    return redirectSettings(request, "?error=twitter_invalid_callback");
  }

  const q = parsed.data;
  if (q.error) {
    const reason = q.error_description
      ? encodeURIComponent(q.error_description.slice(0, 200))
      : q.error;
    return redirectSettings(request, `?error=twitter_denied&detail=${reason}`);
  }

  if (!q.code || !q.state) {
    return redirectSettings(request, "?error=twitter_missing_params");
  }

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(TWITTER_OAUTH_STATE_COOKIE)?.value;
  const codeVerifier = cookieStore.get(TWITTER_OAUTH_CODE_VERIFIER_COOKIE)?.value;
  if (!expectedState || expectedState !== q.state || !codeVerifier) {
    const res = redirectSettings(request, "?error=twitter_state_mismatch");
    clearOAuthCookies(res);
    return res;
  }

  const user = await getDbUserOrNull();
  if (!user) {
    const res = redirectSettings(request, "?error=twitter_unauthorized");
    clearOAuthCookies(res);
    return res;
  }

  let accessToken: string;
  let expiresIn: number;
  let refreshToken: string | undefined;
  try {
    const tokens = await exchangeTwitterCodeForTokens(q.code, codeVerifier);
    accessToken = tokens.access_token;
    expiresIn = tokens.expires_in;
    refreshToken = tokens.refresh_token;
  } catch (e) {
    console.error("[twitter/callback] token exchange failed", e);
    const res = redirectSettings(request, "?error=twitter_token_exchange");
    clearOAuthCookies(res);
    return res;
  }

  let platformUserId: string;
  let displayName: string;
  try {
    const info = await getTwitterUserInfo(accessToken);
    platformUserId = info.id;
    displayName = info.username?.trim()
      ? `@${info.username.trim()}`
      : info.name?.trim()
        ? info.name.trim()
        : "Twitter / X";
  } catch {
    const res = redirectSettings(request, "?error=twitter_userinfo");
    clearOAuthCookies(res);
    return res;
  }

  let accessEnc: string;
  let refreshEnc: string | null;
  try {
    accessEnc = encryptToken(accessToken);
    refreshEnc = refreshToken ? encryptToken(refreshToken) : null;
  } catch {
    const res = redirectSettings(request, "?error=twitter_encrypt");
    clearOAuthCookies(res);
    return res;
  }

  const expiresAt = new Date(Date.now() + Math.max(60, expiresIn) * 1000);

  try {
    await upsertIntegration(user.id, "twitter", {
      status: "connected",
      accessTokenEncrypted: accessEnc,
      refreshTokenEncrypted: refreshEnc,
      expiresAt,
      platformUserId,
      platformDisplayName: displayName,
    });
  } catch {
    const res = redirectSettings(request, "?error=twitter_db");
    clearOAuthCookies(res);
    return res;
  }

  const res = redirectSettings(request, "?connected=twitter");
  clearOAuthCookies(res);
  return res;
}

