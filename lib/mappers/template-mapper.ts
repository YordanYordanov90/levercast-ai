import type { templates } from "@/lib/db/schema";
import type { Template, TemplatePlatform } from "@/types/template";

type TemplateRow = typeof templates.$inferSelect;

interface TemplateMetadata {
  description?: string;
  category?: string;
  platforms?: TemplatePlatform[];
}

export function rowToTemplate(row: TemplateRow): Template {
  const md = (row.metadata ?? {}) as TemplateMetadata;
  return {
    id: row.id,
    name: row.name,
    description: md.description ?? "",
    category: md.category ?? "General",
    content: row.prompt,
    platforms: Array.isArray(md.platforms) ? md.platforms : [],
    createdAt: row.createdAt.toISOString(),
    isSystem: row.userId === null,
  };
}
