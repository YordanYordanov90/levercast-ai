import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

import { getDbUserOrNull } from "@/lib/auth/api-user";
import { LINKEDIN_OAUTH_STATE_COOKIE, LINKEDIN_OAUTH_STATE_MAX_AGE_SEC } from "@/lib/oauth/constants";
import { buildLinkedInAuthUrl } from "@/lib/oauth/linkedin";

export async function GET(request: Request) {
  const user = await getDbUserOrNull();
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
