import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDbUserOrNull } from "@/lib/auth/api-user";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { rowToPost } from "@/lib/mappers/post-mapper";
import { createPostSchema, postListQuerySchema } from "@/lib/validations/post";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: Request) {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const rawStatus = searchParams.get("status");
  const q = postListQuerySchema.safeParse({
    status: rawStatus && rawStatus.length > 0 ? rawStatus : undefined,
  });
  if (!q.success) {
    return jsonError(q.error.issues[0]?.message ?? "Invalid query", 400);
  }

  const conditions = [eq(posts.userId, user.id)];
  if (q.data.status) {
    conditions.push(eq(posts.status, q.data.status));
  }

  const rows = await db
    .select()
    .from(posts)
    .where(and(...conditions))
    .orderBy(desc(posts.updatedAt));

  return NextResponse.json({ data: rows.map(rowToPost) });
}

export async function POST(req: Request) {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const d = parsed.data;
  const [row] = await db
    .insert(posts)
    .values({
      userId: user.id,
      title: d.title ?? null,
      rawContent: d.rawContent,
      formattedContent: d.formattedContent ?? null,
      imageUrl: d.imageUrl ?? null,
      status: d.status ?? "draft",
    })
    .returning();

  if (!row) return jsonError("Failed to create post", 500);
  return NextResponse.json({ data: rowToPost(row) }, { status: 201 });
}
