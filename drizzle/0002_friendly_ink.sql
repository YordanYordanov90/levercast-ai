ALTER TABLE "social_integrations" ADD COLUMN "platform_user_id" text;--> statement-breakpoint
ALTER TABLE "social_integrations" ADD COLUMN "platform_display_name" text;--> statement-breakpoint
CREATE UNIQUE INDEX "social_integrations_user_platform_unique" ON "social_integrations" USING btree ("user_id","platform");