import { getIntegration } from "@/lib/db/integrations";
import { decryptToken } from "@/lib/oauth/encrypt";

export type TwitterAuthFailureCode = "not_connected" | "expired" | "decrypt";

export class TwitterAuthError extends Error {
  readonly code: TwitterAuthFailureCode;

  constructor(code: TwitterAuthFailureCode, message: string) {
    super(message);
    this.name = "TwitterAuthError";
    this.code = code;
  }
}

export async function getTwitterAccessTokenForUser(userId: string): Promise<{
  accessToken: string;
  userId: string;
}> {
  const row = await getIntegration(userId, "twitter");
  if (
    !row ||
    row.status !== "connected" ||
    !row.accessToken ||
    !row.platformUserId
  ) {
    throw new TwitterAuthError(
      "not_connected",
      "Connect Twitter / X in Settings before publishing.",
    );
  }
  if (row.expiresAt && Date.now() > row.expiresAt.getTime()) {
    throw new TwitterAuthError(
      "expired",
      "Twitter / X session expired. Reconnect in Settings.",
    );
  }
  try {
    return {
      accessToken: decryptToken(row.accessToken),
      userId: row.platformUserId,
    };
  } catch {
    throw new TwitterAuthError("decrypt", "Could not read Twitter / X credentials.");
  }
}

