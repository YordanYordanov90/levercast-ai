import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDbUserOrNull } from "@/lib/auth/api-user";
import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { rowToTemplate } from "@/lib/mappers/template-mapper";
import { checkRateLimit } from "@/lib/rate-limit";
import { patchTemplateSchema } from "@/lib/validations/template";

const idParamSchema = z.string().uuid();

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function canRead(row: { userId: string | null }, dbUserId: string) {
  return row.userId === null || row.userId === dbUserId;
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
    .from(templates)
    .where(eq(templates.id, idParsed.data))
    .limit(1);

  if (!row || !canRead(row, user.id)) return jsonError("Not found", 404);
  return NextResponse.json({ data: rowToTemplate(row) });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  const rl = await checkRateLimit("templatesWrite", user.id, {
    route: "/api/templates/[id]",
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

  const parsed = patchTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const patch = parsed.data;
  if (Object.keys(patch).length === 0) {
    return jsonError("No fields to update", 400);
  }

  const [existing] = await db
    .select()
    .from(templates)
    .where(eq(templates.id, idParsed.data))
    .limit(1);

  if (!existing || existing.userId === null || existing.userId !== user.id) {
    return jsonError("Not found", 404);
  }

  const [row] = await db
    .update(templates)
    .set({
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.prompt !== undefined ? { prompt: patch.prompt } : {}),
      ...(patch.metadata !== undefined ? { metadata: patch.metadata } : {}),
    })
    .where(and(eq(templates.id, idParsed.data), eq(templates.userId, user.id)))
    .returning();

  if (!row) return jsonError("Not found", 404);
  return NextResponse.json({ data: rowToTemplate(row) }, { headers: rl.headers });
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  const rl = await checkRateLimit("templatesWrite", user.id, {
    route: "/api/templates/[id]",
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
    .delete(templates)
    .where(
      and(eq(templates.id, idParsed.data), eq(templates.userId, user.id)),
    )
    .returning({ id: templates.id });

  if (deleted.length === 0) return jsonError("Not found", 404);
  return NextResponse.json({ data: { id: idParsed.data } }, { headers: rl.headers });
}
