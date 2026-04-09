"use server";

import { ensureUser } from "@/lib/auth/ensure-user";
import { deleteIntegration } from "@/lib/db/integrations";
import type { SocialPlatformKey } from "@/types/integrations";

export type DisconnectResult = { success: true } | { success: false; error: string };

export async function disconnectIntegration(platform: SocialPlatformKey): Promise<DisconnectResult> {
  try {
    const user = await ensureUser();
    await deleteIntegration(user.id, platform);
    return { success: true };
  } catch {
    return { success: false, error: "Could not disconnect. Try again." };
  }
}
