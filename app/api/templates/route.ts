import { desc, eq, isNull, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDbUserOrNull } from "@/lib/auth/api-user";
import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { rowToTemplate } from "@/lib/mappers/template-mapper";
import { checkRateLimit } from "@/lib/rate-limit";
import { resolveListPagination } from "@/lib/validations/post";
import {
  createTemplateSchema,
  templateListQuerySchema,
} from "@/lib/validations/template";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: Request) {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const rawLimit = searchParams.get("limit");
  const rawOffset = searchParams.get("offset");
  const q = templateListQuerySchema.safeParse({
    limit:
      rawLimit !== null && rawLimit.length > 0 ? rawLimit : undefined,
    offset:
      rawOffset !== null && rawOffset.length > 0 ? rawOffset : undefined,
  });
  if (!q.success) {
    return jsonError(q.error.issues[0]?.message ?? "Invalid query", 400);
  }

  const { limit, offset } = resolveListPagination(q.data);

  const whereClause = or(isNull(templates.userId), eq(templates.userId, user.id));

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(templates)
    .where(whereClause);

  const total = countRow?.count ?? 0;

  const rows = await db
    .select()
    .from(templates)
    .where(whereClause)
    .orderBy(desc(templates.createdAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json({
    data: rows.map(rowToTemplate),
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

  const rl = await checkRateLimit("templatesWrite", user.id, {
    route: "/api/templates",
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

  const parsed = createTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const d = parsed.data;
  const [row] = await db
    .insert(templates)
    .values({
      userId: user.id,
      name: d.name,
      prompt: d.prompt,
      metadata: d.metadata ?? null,
    })
    .returning();

  if (!row) return jsonError("Failed to create template", 500);
  return NextResponse.json({ data: rowToTemplate(row) }, { status: 201, headers: rl.headers });
}
