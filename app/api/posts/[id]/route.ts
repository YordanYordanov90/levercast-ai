import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDbUserOrNull } from "@/lib/auth/api-user";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { deleteR2ObjectByPublicUrlIfOwned } from "@/lib/r2/delete-object";
import { rowToPost } from "@/lib/mappers/post-mapper";
import { checkRateLimit } from "@/lib/rate-limit";
import { patchPostSchema } from "@/lib/validations/post";

const idParamSchema = z.string().uuid();

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const idParsed = idParamSchema.safeParse(id);
  if (!idParsed.success) return jsonError("Invalid id", 400);

  const [row] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, idParsed.data), eq(posts.userId, user.id)))
    .limit(1);

  if (!row) return jsonError("Not found", 404);
  return NextResponse.json({ data: rowToPost(row) });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  const rl = await checkRateLimit("postsWrite", user.id, {
    route: "/api/posts/[id]",
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

  const parsed = patchPostSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const patch = parsed.data;
  if (Object.keys(patch).length === 0) {
    return jsonError("No fields to update", 400);
  }

  let previousImageUrl: string | null | undefined;
  if (patch.imageUrl !== undefined) {
    const [existing] = await db
      .select({ imageUrl: posts.imageUrl })
      .from(posts)
      .where(
        and(eq(posts.id, idParsed.data), eq(posts.userId, user.id)),
      )
      .limit(1);
    if (!existing) return jsonError("Not found", 404);
    previousImageUrl = existing.imageUrl;
  }

  const [row] = await db
    .update(posts)
    .set({
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.rawContent !== undefined ? { rawContent: patch.rawContent } : {}),
      ...(patch.formattedContent !== undefined
        ? { formattedContent: patch.formattedContent }
        : {}),
      ...(patch.imageUrl !== undefined ? { imageUrl: patch.imageUrl } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
    })
    .where(and(eq(posts.id, idParsed.data), eq(posts.userId, user.id)))
    .returning();

  if (!row) return jsonError("Not found", 404);

  if (
    patch.imageUrl !== undefined &&
    previousImageUrl &&
    previousImageUrl !== patch.imageUrl
  ) {
    await deleteR2ObjectByPublicUrlIfOwned(previousImageUrl, user.id);
  }

  return NextResponse.json({ data: rowToPost(row) }, { headers: rl.headers });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  const rl = await checkRateLimit("postsWrite", user.id, {
    route: "/api/posts/[id]",
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

  const deleted = await db
    .delete(posts)
    .where(and(eq(posts.id, idParsed.data), eq(posts.userId, user.id)))
    .returning({ id: posts.id, imageUrl: posts.imageUrl });

  if (deleted.length === 0) return jsonError("Not found", 404);

  await deleteR2ObjectByPublicUrlIfOwned(deleted[0].imageUrl, user.id);

  return NextResponse.json({ data: { id: idParsed.data } }, { headers: rl.headers });
}
