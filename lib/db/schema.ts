import { pgEnum, pgTable, text, timestamp, uuid, jsonb, uniqueIndex, index } from "drizzle-orm/pg-core";

export const postStatusEnum = pgEnum("post_status", ["draft", "pending", "published"]);

export const socialPlatformEnum = pgEnum("social_platform", ["linkedin", "twitter"]);
export const integrationStatusEnum = pgEnum("integration_status", ["disconnected", "connected", "error"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "unpaid",
  "trialing",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),

  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  imageUrl: text("image_url"),

  // Billing fields
  subscriptionStatus: subscriptionStatusEnum("subscription_status"),
  subscriptionPlanId: text("subscription_plan_id"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// AI usage tracking for Free tier limits
export const aiUsageTypeEnum = pgEnum("ai_usage_type", ["post_generation", "template_generation"]);

export const aiUsage = pgTable("ai_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: aiUsageTypeEnum("type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("ai_usage_user_id_idx").on(table.userId),
  index("ai_usage_user_created_idx").on(table.userId, table.createdAt),
]);

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: text("title"),
  rawContent: text("raw_content").notNull(),
  // Platform-specific formatted content; e.g. { linkedin: "...", twitter: "..." }.
  formattedContent: jsonb("formatted_content").$type<Record<string, unknown>>(),
  imageUrl: text("image_url"),

  status: postStatusEnum("status").notNull().default("draft"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
  index("posts_user_id_idx").on(table.userId),
]);

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Null = system template (read-only for all users). */
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  prompt: text("prompt").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (table) => [
  index("templates_user_id_idx").on(table.userId),
]);

export const socialIntegrations = pgTable(
  "social_integrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    platform: socialPlatformEnum("platform").notNull(),
    status: integrationStatusEnum("status").notNull().default("disconnected"),

    /** Platform account id (e.g. LinkedIn person id for urn:li:person:{id}). */
    platformUserId: text("platform_user_id"),
    platformDisplayName: text("platform_display_name"),

    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("social_integrations_user_platform_unique").on(table.userId, table.platform),
  ],
);

