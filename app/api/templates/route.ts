import { desc, eq, isNull, or } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDbUserOrNull } from "@/lib/auth/api-user";
import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { rowToTemplate } from "@/lib/mappers/template-mapper";
import { createTemplateSchema } from "@/lib/validations/template";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  const rows = await db
    .select()
    .from(templates)
    .where(or(isNull(templates.userId), eq(templates.userId, user.id)))
    .orderBy(desc(templates.createdAt));

  return NextResponse.json({ data: rows.map(rowToTemplate) });
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
  return NextResponse.json({ data: rowToTemplate(row) }, { status: 201 });
}
