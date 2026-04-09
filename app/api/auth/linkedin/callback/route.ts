import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getDbUserOrNull } from "@/lib/auth/api-user";
import { upsertIntegration } from "@/lib/db/integrations";
import { LINKEDIN_OAUTH_STATE_COOKIE } from "@/lib/oauth/constants";
import { encryptToken } from "@/lib/oauth/encrypt";
import { exchangeCodeForTokens, getLinkedInUserInfo } from "@/lib/oauth/linkedin";
import { linkedInCallbackQuerySchema } from "@/lib/validations/integrations";

function redirectSettings(request: Request, search: string) {
  return NextResponse.redirect(new URL(`/settings${search}`, request.url));
}

function clearStateCookie(response: NextResponse) {
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set({
    name: LINKEDIN_OAUTH_STATE_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 0,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = Object.fromEntries(searchParams.entries());
  const parsed = linkedInCallbackQuerySchema.safeParse(raw);

  if (!parsed.success) {
    return redirectSettings(request, "?error=linkedin_invalid_callback");
  }

  const q = parsed.data;
  if (q.error) {
    const reason = q.error_description ? encodeURIComponent(q.error_description.slice(0, 200)) : q.error;
    return redirectSettings(request, `?error=linkedin_denied&detail=${reason}`);
  }

  if (!q.code || !q.state) {
    return redirectSettings(request, "?error=linkedin_missing_params");
  }

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(LINKEDIN_OAUTH_STATE_COOKIE)?.value;
  if (!expectedState || expectedState !== q.state) {
    const res = redirectSettings(request, "?error=linkedin_state_mismatch");
    clearStateCookie(res);
    return res;
  }

  const user = await getDbUserOrNull();
  if (!user) {
    const res = redirectSettings(request, "?error=linkedin_unauthorized");
    clearStateCookie(res);
    return res;
  }

  let accessToken: string;
  let expiresIn: number;
  let refreshToken: string | undefined;
  try {
    const tokens = await exchangeCodeForTokens(q.code);
    accessToken = tokens.access_token;
    expiresIn = tokens.expires_in;
    refreshToken = tokens.refresh_token;
  } catch {
    const res = redirectSettings(request, "?error=linkedin_token_exchange");
    clearStateCookie(res);
    return res;
  }

  let sub: string;
  let displayName: string;
  try {
    const info = await getLinkedInUserInfo(accessToken);
    sub = info.sub;
    displayName = info.name?.trim() || info.email || "LinkedIn";
  } catch {
    const res = redirectSettings(request, "?error=linkedin_userinfo");
    clearStateCookie(res);
    return res;
  }

  let accessEnc: string;
  let refreshEnc: string | null;
  try {
    accessEnc = encryptToken(accessToken);
    refreshEnc = refreshToken ? encryptToken(refreshToken) : null;
  } catch {
    const res = redirectSettings(request, "?error=linkedin_encrypt");
    clearStateCookie(res);
    return res;
  }

  const expiresAt = new Date(Date.now() + Math.max(60, expiresIn) * 1000);

  try {
    await upsertIntegration(user.id, "linkedin", {
      status: "connected",
      accessTokenEncrypted: accessEnc,
      refreshTokenEncrypted: refreshEnc,
      expiresAt,
      platformUserId: sub,
      platformDisplayName: displayName,
    });
  } catch {
    const res = redirectSettings(request, "?error=linkedin_db");
    clearStateCookie(res);
    return res;
  }

  const res = redirectSettings(request, "?connected=linkedin");
  clearStateCookie(res);
  return res;
}
