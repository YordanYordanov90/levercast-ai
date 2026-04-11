import { and, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDbUserOrNull } from "@/lib/auth/api-user";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { rowToPost } from "@/lib/mappers/post-mapper";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  createPostSchema,
  postListQuerySchema,
  resolveListPagination,
} from "@/lib/validations/post";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: Request) {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const rawStatus = searchParams.get("status");
  const rawLimit = searchParams.get("limit");
  const rawOffset = searchParams.get("offset");
  const q = postListQuerySchema.safeParse({
    status: rawStatus && rawStatus.length > 0 ? rawStatus : undefined,
    limit:
      rawLimit !== null && rawLimit.length > 0 ? rawLimit : undefined,
    offset:
      rawOffset !== null && rawOffset.length > 0 ? rawOffset : undefined,
  });
  if (!q.success) {
    return jsonError(q.error.issues[0]?.message ?? "Invalid query", 400);
  }

  const { limit, offset } = resolveListPagination(q.data);

  const conditions = [eq(posts.userId, user.id)];
  if (q.data.status) {
    conditions.push(eq(posts.status, q.data.status));
  }

  const whereClause = and(...conditions);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .where(whereClause);

  const total = countRow?.count ?? 0;

  const rows = await db
    .select()
    .from(posts)
    .where(whereClause)
    .orderBy(desc(posts.updatedAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({
    data: rows.map(rowToPost),
    meta: {
      limit,
      offset,
      total,
      hasMore: offset + rows.length < total,
    },
  });
}

export async function POST(req: Request) {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  const rl = await checkRateLimit("postsWrite", user.id, {
    route: "/api/posts",
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: rl.errorMessage ?? "Too many requests. Please slow down." },
      { status: rl.status ?? 429, headers: rl.headers },
    );
  }

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
  return NextResponse.json({ data: rowToPost(row) }, { status: 201, headers: rl.headers });
}
