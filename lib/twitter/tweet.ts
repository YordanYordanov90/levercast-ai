type TwitterTweetResponse = {
  data?: { id: string; text?: string };
};

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

  const json = (await res.json()) as unknown as TwitterTweetResponse;
  const id = json?.data?.id;
  if (!id) throw new Error("Twitter publish failed: missing tweet id");

  return { id } as const;
}

