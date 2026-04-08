export type TemplatePlatform = "linkedin" | "twitter";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  /** LLM / editor body (maps to DB `prompt`). */
  content: string;
  platforms: TemplatePlatform[];
  createdAt: string;
  /** True when `user_id` is null (system seed templates). */
  isSystem: boolean;
}
