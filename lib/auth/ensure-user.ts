import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import {
  clerkProfileFromClerkUser,
  upsertClerkUserProfile,
} from "@/lib/db/clerk-user";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * Ensures the signed-in Clerk user has a row in `users`.
 * Fast path: returns existing row. Slow path: upserts from Clerk session (webhook fallback).
 */
export async function ensureUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("ensureUser: not authenticated");
  }

  const [existing] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  if (existing) return existing;

  const clerkUser = await currentUser();
  const profile = clerkUser
    ? clerkProfileFromClerkUser(clerkUser)
    : {
        clerkId: userId,
        email: null,
        firstName: null,
        lastName: null,
        imageUrl: null,
      };

  return upsertClerkUserProfile(profile);
}
