/**
 * Member UGC Posts (text-only v1). Images require a separate asset upload flow.
 * @see https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/ugc-post-api
 */

const UGC_POSTS_URL = "https://api.linkedin.com/v2/ugcPosts";

/** LinkedIn share commentary limit (conservative). */
export const LINKEDIN_SHARE_TEXT_MAX = 3000;

export async function publishMemberFeedShare(args: {
  accessToken: string;
  personId: string;
  text: string;
}): Promise<{ urn: string }> {
  const text = args.text.trim();
  if (!text) {
    throw new Error("LinkedIn post text is empty.");
  }
  if (text.length > LINKEDIN_SHARE_TEXT_MAX) {
    throw new Error(
      `LinkedIn post must be at most ${LINKEDIN_SHARE_TEXT_MAX} characters (got ${text.length}).`,
    );
  }

  const body = {
    author: `urn:li:person:${args.personId}`,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: {
          text,
          attributes: [] as unknown[],
        },
        shareMediaCategory: "NONE",
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const res = await fetch(UGC_POSTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  const json: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    let msg = `LinkedIn returned ${res.status}`;
    if (typeof json === "object" && json !== null) {
      const o = json as Record<string, unknown>;
      if (typeof o.message === "string") msg = o.message;
      else if (Array.isArray(o.errorDetails) && o.errorDetails[0]) {
        const d = o.errorDetails[0] as Record<string, unknown>;
        if (typeof d.message === "string") msg = d.message;
      }
    }
    throw new Error(msg);
  }

  /** LinkedIn often returns the URN only in `x-restli-id` on 201 Created. */
  const headerUrn =
    res.headers.get("x-restli-id") ??
    res.headers.get("X-RestLi-Id") ??
    res.headers.get("X-RESTLI-ID");
  if (typeof headerUrn === "string" && headerUrn.length > 0) {
    return { urn: headerUrn };
  }

  if (
    typeof json === "object" &&
    json !== null &&
    "id" in json &&
    typeof (json as { id: unknown }).id === "string"
  ) {
    return { urn: (json as { id: string }).id };
  }

  throw new Error("LinkedIn did not return a post id (no x-restli-id header or id in body).");
}
