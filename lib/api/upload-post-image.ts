import { fetchJson } from "@/lib/api/fetch-json";
import {
  allowedImageContentTypes,
  MAX_POST_IMAGE_BYTES,
} from "@/lib/validations/upload";

const allowedSet = new Set<string>(allowedImageContentTypes);

interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export async function uploadPostImageViaR2(file: File): Promise<string> {
  if (!allowedSet.has(file.type)) {
    throw new Error("Unsupported image type (use JPEG, PNG, WebP, or GIF)");
  }
  if (file.size <= 0 || file.size > MAX_POST_IMAGE_BYTES) {
    throw new Error(`Image must be under ${MAX_POST_IMAGE_BYTES / (1024 * 1024)} MB`);
  }

  let uploadUrl: string;
  let publicUrl: string;
  try {
    const presign = await fetchJson<PresignResponse>(
      "/api/uploads/presign",
      {
        method: "POST",
        body: JSON.stringify({
          contentType: file.type,
          fileSize: file.size,
        }),
      },
    );
    uploadUrl = presign.uploadUrl;
    publicUrl = presign.publicUrl;
  } catch (e) {
    const isNetwork =
      e instanceof TypeError ||
      (e instanceof Error && e.message === "Failed to fetch");
    if (isNetwork) {
      throw new Error(
        "Could not reach the app to start upload. Check the dev server, sign-in, and try again.",
      );
    }
    throw e;
  }

  let putRes: Response;
  try {
    putRes = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
  } catch (e) {
    const isNetwork =
      e instanceof TypeError ||
      (e instanceof Error && e.message === "Failed to fetch");
    if (isNetwork) {
      throw new Error(
        "Browser blocked the upload to Cloudflare R2 (network/CORS). In R2 → your bucket → Settings → CORS, allow your app origin, PUT, and headers (e.g. AllowedHeaders: *).",
      );
    }
    throw e;
  }

  if (!putRes.ok) {
    throw new Error(`Upload to storage failed (${putRes.status})`);
  }

  return publicUrl;
}
