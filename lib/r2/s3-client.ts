import { S3Client } from "@aws-sdk/client-s3";

import type { R2Config } from "./config";

export function createR2S3Client(cfg: R2Config) {
  return new S3Client({
    region: "auto",
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
}
