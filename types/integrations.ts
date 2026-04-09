export type SocialPlatformKey = "linkedin" | "twitter";

export interface LinkedInTokens {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

export interface LinkedInUserInfo {
  /** OIDC subject — LinkedIn member id. */
  sub: string;
  name?: string;
  email?: string;
}

export type IntegrationUiStatus = "connected" | "disconnected" | "error";

export interface SocialIntegrationStatus {
  platform: SocialPlatformKey;
  status: IntegrationUiStatus;
  displayName?: string;
}
