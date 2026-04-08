import { auth } from "@clerk/nextjs/server";

import { ensureUser } from "@/lib/auth/ensure-user";

/** Returns DB user row or null if not signed in. */
export async function getDbUserOrNull() {
  const { userId } = await auth();
  if (!userId) return null;
  return ensureUser();
}
