import { z } from "zod";

const twitterTweetResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    text: z.string().optional(),
  }).optional(),
});

export async function postTweet(arg: { accessToken: string; text: string }) {
  const text = arg.text.trim();
  if (!text) throw new Error("Tweet text is empty");

  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${arg.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Twitter publish failed (${res.status}): ${body || res.statusText}`);
  }

  const json = await res.json();
  const parseResult = twitterTweetResponseSchema.safeParse(json);
  if (!parseResult.success || !parseResult.data.data?.id) {
    console.error("[twitter] Tweet response validation failed:", parseResult.error?.issues);
    throw new Error("Twitter publish failed: invalid response");
  }

  return { id: parseResult.data.data.id } as const;
}

