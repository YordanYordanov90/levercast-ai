export type PostStatus = "draft" | "pending" | "published";

export interface PostPlatform {
  name: "linkedin" | "twitter";
  content: string;
  publishedUrl?: string;
}

/** Client / API shape for posts (aligned with DB via mappers). */
export interface Post {
  id: string;
  title: string;
  excerpt: string;
  /** Raw idea body (maps to DB `raw_content`). */
  content: string;
  platforms: PostPlatform[];
  status: PostStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
