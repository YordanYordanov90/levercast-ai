import { getIntegration } from "@/lib/db/integrations";
import { decryptToken } from "@/lib/oauth/encrypt";

export type LinkedInAuthFailureCode = "not_connected" | "expired" | "decrypt";

export class LinkedInAuthError extends Error {
  readonly code: LinkedInAuthFailureCode;

  constructor(code: LinkedInAuthFailureCode, message: string) {
    super(message);
    this.name = "LinkedInAuthError";
    this.code = code;
  }
}

export async function getLinkedInAccessTokenForUser(userId: string): Promise<{
  accessToken: string;
  personId: string;
}> {
  const row = await getIntegration(userId, "linkedin");
  if (
    !row ||
    row.status !== "connected" ||
    !row.accessToken ||
    !row.platformUserId
  ) {
    throw new LinkedInAuthError(
      "not_connected",
      "Connect LinkedIn in Settings before publishing.",
    );
  }
  if (row.expiresAt && Date.now() > row.expiresAt.getTime()) {
    throw new LinkedInAuthError(
      "expired",
      "LinkedIn session expired. Reconnect in Settings.",
    );
  }
  try {
    return {
      accessToken: decryptToken(row.accessToken),
      personId: row.platformUserId,
    };
  } catch {
    throw new LinkedInAuthError("decrypt", "Could not read LinkedIn credentials.");
  }
}
