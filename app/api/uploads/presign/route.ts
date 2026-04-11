import { NextResponse } from "next/server";

import { getDbUserOrNull } from "@/lib/auth/api-user";
import { checkRateLimit } from "@/lib/rate-limit";
import { createPresignedImagePut } from "@/lib/r2/presign-put";
import {
  presignPostBodySchema,
} from "@/lib/validations/upload";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const user = await getDbUserOrNull();
  if (!user) return jsonError("Unauthorized", 401);

  const rl = await checkRateLimit("uploadPresign", user.id, {
    route: "/api/uploads/presign",
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

  const parsed = presignPostBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(
      parsed.error.issues[0]?.message ?? "Invalid body",
      400,
    );
  }

  try {
    const result = await createPresignedImagePut({
      dbUserId: user.id,
      contentType: parsed.data.contentType,
      fileSize: parsed.data.fileSize,
    });
    return NextResponse.json({ data: result }, { headers: rl.headers });
  } catch (e) {
    console.error("[uploads/presign]", e);
    if (e instanceof Error && e.message === "R2 is not configured") {
      return jsonError("Image upload is not configured", 503);
    }
    return jsonError("Upload failed", 500);
  }
}
