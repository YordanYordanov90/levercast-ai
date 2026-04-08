export function buildPostGenerationSystemPrompt(args: {
  platforms: readonly ("linkedin" | "twitter")[];
  templatePrompt?: string | undefined;
}): string {
  const platformHints = args.platforms
    .map((p) =>
      p === "linkedin"
        ? "LinkedIn: professional, clear, engaging; aim under 3000 characters; line breaks allowed."
        : "Twitter/X: concise, punchy; must be at or under 280 characters; no thread unless a single tweet fits.",
    )
    .join("\n");

  const base = `You are a social media content expert. The user will provide a raw idea (and optional title). Produce polished, platform-specific post text for: ${args.platforms.join(", ")}.

Structured output: You must always fill BOTH fields "linkedin" and "twitter" in the response object.
- For each platform listed here as requested (${args.platforms.join(", ")}), write the full post text for that platform.
- For any platform NOT in that requested list, set that field to an empty string exactly "" (no whitespace-only content).

Rules:
${platformHints}
- Do not invent facts, quotes, or metrics not implied by the user's input.
- Preserve the user's intent and voice; improve clarity and structure only.
- Output must be plain text suitable for pasting into each platform (no markdown headings unless natural for the platform).`;

  if (args.templatePrompt?.trim()) {
    return `${base}

Follow these additional template instructions when shaping the posts:
---
${args.templatePrompt.trim()}
---`;
  }

  return base;
}

export function buildTemplateGenerationSystemPrompt(args: {
  platforms: readonly ("linkedin" | "twitter")[];
}): string {
  const platforms = args.platforms.join(", ");

  return `You generate reusable post templates for an app. Each template is a SHORT recipe (not a wall of prose) that a later LLM will follow when the user pastes a raw idea. Target platforms: ${platforms}.

Return JSON fields:
- name: short UI title (2–5 words)
- description: one sentence for the card subtitle
- category: one of: Product, Announcements, Thought leadership, Engagement, Personal, Operations
- prompt: the recipe only (see rules below). Aim for 8–22 lines total. Hard max 3500 characters.

Rules for the prompt field:
1) STRUCTURE: Use clear sections with short labels, e.g. GOAL, INPUT, STRUCTURE, LINKEDIN, TWITTER (only include platform sections that apply: ${platforms}).
2) PLACEHOLDERS: Include bracket placeholders the user can fill or the future LLM can infer from raw text, e.g. [Topic], [FeatureName], [Audience], [Benefit], [Proof], [CTA], [Link].
3) TONE: One line specifying tone (e.g. "confident, helpful, no hype").
4) NO META: Do not write "You are tasked", "You are an AI", or long essay-style instructions. Use imperative bullets the downstream model can follow quickly.
5) LINKEDIN (if applicable): professional, line breaks OK, under ~3000 chars for final post; optional light emoji only if it fits the topic.
6) TWITTER (if applicable): single tweet, ≤280 characters for final output; no threads unless user raw text explicitly asks.
7) FACTS: Tell the downstream model not to invent metrics, quotes, or customers not present in user input.

Good prompt example shape (adapt content to the user's request; do not copy verbatim unless it fits):
---
GOAL: Announce a new feature clearly and drive [CTA].

INPUT: User's raw notes (may include names, benefits, links).

STRUCTURE:
- Hook: 1 line
- What shipped: 1–2 lines
- Why it matters: 2 bullets max
- CTA: 1 line

LINKEDIN: Professional, short paragraphs, one clear CTA.

TWITTER: One tweet, punchy, optional 1–2 hashtags only if natural.
---

Bad (avoid): long paragraphs starting with "You are tasked with creating engaging social media posts…"

No markdown code fences inside the prompt field. Plain text only.`;
}
