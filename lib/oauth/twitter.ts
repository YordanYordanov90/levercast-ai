import crypto from "crypto";
import { z } from "zod";

const twitterTokenResponseSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
});

const twitterMeResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    name: z.string().optional(),
    username: z.string().optional(),
  }).optional(),
});

function base64UrlEncode(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function generateTwitterOAuthState() {
  return crypto.randomBytes(16).toString("hex");
}

export function generateTwitterCodeVerifier() {
  // RFC 7636 allows 43-128 chars; base64url(32 bytes) => 43 chars.
  return base64UrlEncode(crypto.randomBytes(32));
}

export function deriveTwitterCodeChallenge(codeVerifier: string) {
  const hash = crypto.createHash("sha256").update(codeVerifier).digest();
  return base64UrlEncode(hash);
}

function getTwitterEnv() {
  const clientId = process.env.TWITTER_CLIENT_ID;
  const clientSecret = process.env.TWITTER_CLIENT_SECRET;
  const redirectUri = process.env.TWITTER_REDIRECT_URI;

  return {
    clientId: clientId && clientId.trim() ? clientId : null,
    clientSecret: clientSecret && clientSecret.trim() ? clientSecret : null,
    redirectUri: redirectUri && redirectUri.trim() ? redirectUri : null,
  } as const;
}

export function hasTwitterOAuthConfig() {
  const env = getTwitterEnv();
  return !!(env.clientId && env.clientSecret && env.redirectUri);
}

export function buildTwitterAuthUrl(arg: {
  state: string;
  codeChallenge: string;
  scope?: string[];
}) {
  const env = getTwitterEnv();
  if (!env.clientId || !env.redirectUri) throw new Error("Twitter OAuth not configured");

  const scope = (arg.scope ?? ["tweet.read", "tweet.write", "users.read", "offline.access"]).join(
    " ",
  );

  const url = new URL("https://twitter.com/i/oauth2/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", env.clientId);
  url.searchParams.set("redirect_uri", env.redirectUri);
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", arg.state);
  url.searchParams.set("code_challenge", arg.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  return url.toString();
}

export async function exchangeTwitterCodeForTokens(code: string, codeVerifier: string) {
  const env = getTwitterEnv();
  if (!env.clientId || !env.clientSecret || !env.redirectUri) {
    throw new Error("Twitter OAuth not configured");
  }

  const basic = Buffer.from(`${env.clientId}:${env.clientSecret}`, "utf8").toString("base64");

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  body.set("redirect_uri", env.redirectUri);
  body.set("code_verifier", codeVerifier);

  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Twitter token exchange failed (${res.status}): ${text || res.statusText}`);
  }

  const json = await res.json();
  const parseResult = twitterTokenResponseSchema.safeParse(json);
  if (!parseResult.success) {
    console.error("[twitter] Token response validation failed:", parseResult.error.issues);
    throw new Error("Twitter token exchange returned invalid response");
  }

  return parseResult.data;
}

export async function getTwitterUserInfo(accessToken: string) {
  const url = new URL("https://api.twitter.com/2/users/me");
  url.searchParams.set("user.fields", "name,username");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Twitter userinfo failed (${res.status}): ${text || res.statusText}`);
  }

  const json = await res.json();
  const parseResult = twitterMeResponseSchema.safeParse(json);
  if (!parseResult.success || !parseResult.data.data?.id) {
    console.error("[twitter] Userinfo response validation failed:", parseResult.error?.issues);
    throw new Error("Twitter userinfo returned invalid response");
  }

  const d = parseResult.data.data;
  return {
    id: d.id,
    name: d.name ?? null,
    username: d.username ?? null,
  } as const;
}

