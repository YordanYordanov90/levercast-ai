import { z } from "zod";
import type { templates } from "@/lib/db/schema";
import type { Template, TemplatePlatform } from "@/types/template";

type TemplateRow = typeof templates.$inferSelect;

interface TemplateMetadata {
  description?: string;
  category?: string;
  platforms?: TemplatePlatform[];
}

const templatePlatformSchema = z.enum(["linkedin", "twitter"]);

function validatePlatforms(platforms: unknown): TemplatePlatform[] {
  if (!Array.isArray(platforms)) return [];
  
  return platforms.filter((p): p is TemplatePlatform => {
    const result = templatePlatformSchema.safeParse(p);
    if (!result.success) {
      console.warn(`[template-mapper] Invalid platform value: ${p}`);
    }
    return result.success;
  });
}

export function rowToTemplate(row: TemplateRow): Template {
  const md = (row.metadata ?? {}) as TemplateMetadata;
  return {
    id: row.id,
    name: row.name,
    description: md.description ?? "",
    category: md.category ?? "General",
    content: row.prompt,
    platforms: validatePlatforms(md.platforms),
    createdAt: row.createdAt.toISOString(),
    isSystem: row.userId === null,
  };
}
