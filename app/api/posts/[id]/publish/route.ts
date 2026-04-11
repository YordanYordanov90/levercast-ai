import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDbUserOrNull } from "@/lib/auth/api-user";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { LinkedInAuthError, getLinkedInAccessTokenForUser } from "@/lib/linkedin/access-token";
import { publishMemberFeedShare } from "@/lib/linkedin/ugc-post";
import { rowToPost } from "@/lib/mappers/post-mapper";
import { checkRateLimit } from "@/lib/rate-limit";
import { TwitterAuthError, getTwitterAccessTokenForUser } from "@/lib/twitter/access-token";
import { postTweet } from "@/lib/twitter/tweet";
import { publishPostBodySchema } from "@/lib/validations/post";

const idParamSchema = z.string().uuid();

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function mergeFormattedForPublish(
  existing: unknown,
  patch: { linkedin?: string; twitter?: string },
  meta: { linkedin?: { urn: string; publishedAt: string }; twitter?: { id: string; publishedAt: string } },
): Record<string, unknown> {
  const base =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? { ...(existing as Record<string, unknown>) }
      : {};
  if (patch.linkedin !== undefined) base.linkedin = patch.linkedin;
  if (patch.twitter !== undefined) base.twitter = patch.twitter;
  const prevPublish =
    base._publish && typeof base._publish === "object" && !Array.isArray(base._publish)
      ? (base._publish as Record<string, unknown>)
      : {};
  base._publish = {
    ...prevPublish,
    ...(meta.linkedin ? { linkedin: meta.linkedin } : {}),
    ...(meta.twitter ? { twitter: meta.twitter } : {}),
  };
  return base;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  const rl = await checkRateLimit("publish", user.id, {
    route: "/api/posts/[id]/publish",
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: rl.errorMessage ?? "Too many requests. Please slow down." },
      { status: rl.status ?? 429, headers: rl.headers },
    );
  }

  const { id } = await ctx.params;
  const idParsed = idParamSchema.safeParse(id);
  if (!idParsed.success) return jsonError("Invalid id", 400);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = publishPostBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const d = parsed.data;

  const [row] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, idParsed.data), eq(posts.userId, user.id)))
    .limit(1);

  if (!row) return jsonError("Not found", 404);

  const wantsLinkedIn = d.publishTo.includes("linkedin");
  const wantsTwitter = d.publishTo.includes("twitter");
  if (!wantsLinkedIn && !wantsTwitter) {
    return jsonError("No supported publish target", 400);
  }

  const publishResults: {
    linkedin?: { ok: true; urn: string; publishedAt: string } | { ok: false; error: string };
    twitter?: { ok: true; id: string; publishedAt: string } | { ok: false; error: string };
  } = {};

  const meta: {
    linkedin?: { urn: string; publishedAt: string };
    twitter?: { id: string; publishedAt: string };
  } = {};

  if (wantsLinkedIn) {
    const li = d.formattedContent.linkedin?.trim() ?? "";
    if (!li) {
      return jsonError("LinkedIn body is empty. Add text for the LinkedIn version.", 400);
    }

    try {
      const access = await getLinkedInAccessTokenForUser(user.id);
      const { urn } = await publishMemberFeedShare({
        accessToken: access.accessToken,
        personId: access.personId,
        text: li,
      });
      const publishedAt = new Date().toISOString();
      meta.linkedin = { urn, publishedAt };
      publishResults.linkedin = { ok: true, urn, publishedAt };
    } catch (e) {
      if (e instanceof LinkedInAuthError) {
        const status = e.code === "expired" ? 409 : e.code === "not_connected" ? 403 : 500;
        return jsonError(e.message, status);
      }
      publishResults.linkedin = {
        ok: false,
        error: "LinkedIn publish failed",
      };
    }
  }

  if (wantsTwitter) {
    const tw = d.formattedContent.twitter?.trim() ?? "";
    if (!tw) {
      return jsonError("Twitter / X body is empty. Add text for the Twitter / X version.", 400);
    }

    try {
      const access = await getTwitterAccessTokenForUser(user.id);
      const { id } = await postTweet({ accessToken: access.accessToken, text: tw });
      const publishedAt = new Date().toISOString();
      meta.twitter = { id, publishedAt };
      publishResults.twitter = { ok: true, id, publishedAt };
    } catch (e) {
      if (e instanceof TwitterAuthError) {
        const status = e.code === "expired" ? 409 : e.code === "not_connected" ? 403 : 500;
        return jsonError(e.message, status);
      }
      publishResults.twitter = {
        ok: false,
        error: "Twitter / X publish failed",
      };
    }
  }

  if (!meta.linkedin && !meta.twitter) {
    const liErr =
      publishResults.linkedin && "error" in publishResults.linkedin ? publishResults.linkedin.error : "";
    const twErr =
      publishResults.twitter && "error" in publishResults.twitter ? publishResults.twitter.error : "";
    const msg = [liErr, twErr].filter(Boolean).join(" | ") || "Publish failed";
    return jsonError(msg, 502);
  }

  const nextFormatted = mergeFormattedForPublish(row.formattedContent, d.formattedContent, meta);

  const [updated] = await db
    .update(posts)
    .set({
      title: d.title ?? null,
      rawContent: d.rawContent,
      formattedContent: nextFormatted,
      imageUrl: d.imageUrl ?? null,
      status: "published",
    })
    .where(and(eq(posts.id, idParsed.data), eq(posts.userId, user.id)))
    .returning();

  if (!updated) return jsonError("Not found", 404);
  return NextResponse.json(
    { data: rowToPost(updated), publishResults },
    { headers: rl.headers },
  );
}
