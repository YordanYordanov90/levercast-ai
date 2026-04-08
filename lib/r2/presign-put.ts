import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

import type { AllowedImageContentType } from "@/lib/validations/upload";

import { getR2Config } from "./config";
import { createR2S3Client } from "./s3-client";

const extByType: Record<AllowedImageContentType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export interface PresignPutResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export async function createPresignedImagePut(args: {
  dbUserId: string;
  contentType: AllowedImageContentType;
  fileSize: number;
}): Promise<PresignPutResult> {
  const cfg = getR2Config();
  if (!cfg) {
    throw new Error("R2 is not configured");
  }

  const ext = extByType[args.contentType];
  const key = `users/${args.dbUserId}/${randomUUID()}.${ext}`;

  const client = createR2S3Client(cfg);
  const command = new PutObjectCommand({
    Bucket: cfg.bucketName,
    Key: key,
    ContentType: args.contentType,
    ContentLength: args.fileSize,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 120 });
  const publicUrl = `${cfg.publicBaseUrl}/${key}`;

  return { uploadUrl, publicUrl, key };
}
