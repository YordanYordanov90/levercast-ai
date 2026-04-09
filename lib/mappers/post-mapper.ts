import type { posts } from "@/lib/db/schema";
import type { Post, PostPlatform } from "@/types/post";

type PostRow = typeof posts.$inferSelect;

function linkedinPublishedUrlFromFormatted(
  formatted: Record<string, unknown>,
): string | undefined {
  const publish = formatted._publish;
  if (!publish || typeof publish !== "object" || Array.isArray(publish)) {
    return undefined;
  }
  const liPub = (publish as Record<string, unknown>).linkedin;
  if (!liPub || typeof liPub !== "object" || Array.isArray(liPub)) {
    return undefined;
  }
  const permalink = (liPub as Record<string, unknown>).permalink;
  return typeof permalink === "string" ? permalink : undefined;
}

function formattedToPlatforms(
  formatted: Record<string, unknown> | null | undefined,
): PostPlatform[] {
  if (!formatted || typeof formatted !== "object") return [];
  const out: PostPlatform[] = [];
  const li = formatted.linkedin;
  const tw = formatted.twitter;
  const liUrl = linkedinPublishedUrlFromFormatted(formatted);
  if (typeof li === "string" && li.length > 0) {
    out.push({ name: "linkedin", content: li, publishedUrl: liUrl });
  }
  if (typeof tw === "string" && tw.length > 0) {
    out.push({ name: "twitter", content: tw });
  }
  return out;
}

export function rowToPost(row: PostRow): Post {
  const platforms = formattedToPlatforms(row.formattedContent as Record<string, unknown> | null);
  const title =
    (row.title && row.title.trim()) ||
    (row.rawContent.split("\n")[0]?.slice(0, 120).trim() || "Untitled");
  const excerpt =
    row.rawContent.length > 160 ? `${row.rawContent.slice(0, 157)}...` : row.rawContent;

  return {
    id: row.id,
    title,
    excerpt: excerpt || "—",
    content: row.rawContent,
    platforms,
    status: row.status,
    imageUrl: row.imageUrl ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
