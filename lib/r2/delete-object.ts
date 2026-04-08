import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { getR2Config } from "./config";
import { createR2S3Client } from "./s3-client";

/**
 * Parses `imageUrl` if it is under our public base and owned by `dbUserId`, then deletes the object.
 * Best-effort: logs non-fatal errors (post already removed from DB per Option A).
 */
export async function deleteR2ObjectByPublicUrlIfOwned(
  imageUrl: string | null | undefined,
  dbUserId: string,
): Promise<void> {
  const cfg = getR2Config();
  if (!cfg || !imageUrl?.trim()) return;

  const key = extractOwnedObjectKey(imageUrl.trim(), cfg.publicBaseUrl, dbUserId);
  if (!key) return;

  const client = createR2S3Client(cfg);
  try {
    await client.send(
      new DeleteObjectCommand({ Bucket: cfg.bucketName, Key: key }),
    );
  } catch (e) {
    console.error("[r2] DeleteObject failed", { key, err: e });
  }
}

function extractOwnedObjectKey(
  imageUrl: string,
  publicBaseUrl: string,
  dbUserId: string,
): string | null {
  const base = publicBaseUrl.replace(/\/$/, "");
  const prefix = `${base}/`;
  if (!imageUrl.startsWith(prefix)) return null;

  const encoded = imageUrl.slice(prefix.length);
  let key: string;
  try {
    key = decodeURIComponent(encoded);
  } catch {
    return null;
  }

  const expectedPrefix = `users/${dbUserId}/`;
  if (!key.startsWith(expectedPrefix)) return null;
  if (key.includes("..") || key.includes("\\")) return null;

  return key;
}
