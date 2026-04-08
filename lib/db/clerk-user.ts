import type { User } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export interface ClerkUserProfile {
  clerkId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

/** Map Clerk session user (currentUser) to DB columns. */
export function clerkProfileFromClerkUser(user: User): ClerkUserProfile {
  const primaryEmail = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress;
  return {
    clerkId: user.id,
    email: primaryEmail ?? user.emailAddresses[0]?.emailAddress ?? null,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    imageUrl: user.imageUrl ?? null,
  };
}

/** Map Clerk webhook user JSON to DB columns (snake_case payload). */
export function clerkProfileFromWebhookUser(data: {
  id: string;
  email_addresses?: { id: string; email_address: string }[];
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
}): ClerkUserProfile {
  const primaryEmail = data.email_addresses?.find((e) => e.id === data.primary_email_address_id)?.email_address;
  return {
    clerkId: data.id,
    email: primaryEmail ?? null,
    firstName: data.first_name ?? null,
    lastName: data.last_name ?? null,
    imageUrl: data.image_url ?? null,
  };
}

/** Idempotent upsert used by webhooks and ensureUser. */
export async function upsertClerkUserProfile(profile: ClerkUserProfile) {
  const [row] = await db
    .insert(users)
    .values({
      clerkId: profile.clerkId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      imageUrl: profile.imageUrl,
    })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: {
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        imageUrl: profile.imageUrl,
        updatedAt: new Date(),
      },
    })
    .returning();

  if (!row) {
    const [found] = await db.select().from(users).where(eq(users.clerkId, profile.clerkId)).limit(1);
    if (!found) throw new Error("upsertClerkUserProfile: row missing after upsert");
    return found;
  }

  return row;
}
