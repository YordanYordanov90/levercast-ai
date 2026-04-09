import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { socialIntegrations } from "@/lib/db/schema";
import type { SocialPlatformKey } from "@/types/integrations";

export type IntegrationRow = typeof socialIntegrations.$inferSelect;

export async function getIntegration(
  userId: string,
  platform: SocialPlatformKey,
): Promise<IntegrationRow | null> {
  const [row] = await db
    .select()
    .from(socialIntegrations)
    .where(and(eq(socialIntegrations.userId, userId), eq(socialIntegrations.platform, platform)))
    .limit(1);
  return row ?? null;
}

export interface UpsertIntegrationInput {
  status: "connected" | "disconnected" | "error";
  accessTokenEncrypted?: string | null;
  refreshTokenEncrypted?: string | null;
  expiresAt?: Date | null;
  platformUserId?: string | null;
  platformDisplayName?: string | null;
}

export async function upsertIntegration(
  userId: string,
  platform: SocialPlatformKey,
  data: UpsertIntegrationInput,
): Promise<IntegrationRow> {
  const now = new Date();
  const [row] = await db
    .insert(socialIntegrations)
    .values({
      userId,
      platform,
      status: data.status,
      accessToken: data.accessTokenEncrypted ?? null,
      refreshToken: data.refreshTokenEncrypted ?? null,
      expiresAt: data.expiresAt ?? null,
      platformUserId: data.platformUserId ?? null,
      platformDisplayName: data.platformDisplayName ?? null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [socialIntegrations.userId, socialIntegrations.platform],
      set: {
        status: data.status,
        accessToken: data.accessTokenEncrypted ?? null,
        refreshToken: data.refreshTokenEncrypted ?? null,
        expiresAt: data.expiresAt ?? null,
        platformUserId: data.platformUserId ?? null,
        platformDisplayName: data.platformDisplayName ?? null,
        updatedAt: now,
      },
    })
    .returning();

  if (!row) {
    throw new Error("upsertIntegration: no row returned");
  }
  return row;
}

export async function deleteIntegration(userId: string, platform: SocialPlatformKey): Promise<void> {
  await upsertIntegration(userId, platform, {
    status: "disconnected",
    accessTokenEncrypted: null,
    refreshTokenEncrypted: null,
    expiresAt: null,
    platformUserId: null,
    platformDisplayName: null,
  });
}
