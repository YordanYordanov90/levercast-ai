import { z } from "zod";

import type { LinkedInTokens, LinkedInUserInfo } from "@/types/integrations";

const LINKEDIN_AUTH = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_USERINFO = "https://api.linkedin.com/v2/userinfo";

export const LINKEDIN_SCOPES = ["openid", "profile", "email", "w_member_social"] as const;

const tokenResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
});

const userInfoSchema = z.object({
  sub: z.string(),
  name: z.string().optional(),
  email: z.string().optional(),
});

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`${name} is not configured`);
  }
  return v;
}

export function buildLinkedInAuthUrl(state: string): string {
  const clientId = requireEnv("LINKEDIN_CLIENT_ID");
  const redirectUri = requireEnv("LINKEDIN_REDIRECT_URI");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: LINKEDIN_SCOPES.join(" "),
  });
  return `${LINKEDIN_AUTH}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<LinkedInTokens> {
  const clientId = requireEnv("LINKEDIN_CLIENT_ID");
  const clientSecret = requireEnv("LINKEDIN_CLIENT_SECRET");
  const redirectUri = requireEnv("LINKEDIN_REDIRECT_URI");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const res = await fetch(LINKEDIN_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof json === "object" && json !== null && "error_description" in json
        ? String((json as { error_description?: string }).error_description)
        : `LinkedIn token exchange failed (${res.status})`;
    throw new Error(msg);
  }

  const parsed = tokenResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Invalid token response from LinkedIn");
  }
  const d = parsed.data;
  return {
    access_token: d.access_token,
    expires_in: d.expires_in ?? 3600,
    refresh_token: d.refresh_token,
  };
}

export async function getLinkedInUserInfo(accessToken: string): Promise<LinkedInUserInfo> {
  const res = await fetch(LINKEDIN_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`LinkedIn userinfo failed (${res.status})`);
  }
  const parsed = userInfoSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Invalid userinfo from LinkedIn");
  }
  return {
    sub: parsed.data.sub,
    name: parsed.data.name,
    email: parsed.data.email,
  };
}
