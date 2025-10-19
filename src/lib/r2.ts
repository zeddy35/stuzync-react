// src/lib/r2.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_BASE, // ör: https://pub-xxxxxx.r2.dev  ya da cdn.domain.com
} = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET || !R2_PUBLIC_BASE) {
  throw new Error("R2 env vars missing. Check .env.local");
}

// R2 S3 endpoint’i
const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export const r2 = new S3Client({
  region: "auto",
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
});

export function r2PublicUrl(key: string) {
  // R2_PUBLIC_BASE + key
  return `${R2_PUBLIC_BASE!.replace(/\/+$/,'')}/${key.replace(/^\/+/,'')}`;
}

export async function r2PutObject(key: string, body: Buffer | Uint8Array, contentType?: string) {
  const put = new PutObjectCommand({
    Bucket: R2_BUCKET!,
    Key: key,
    Body: body,
    ContentType: contentType || "application/octet-stream",
    ACL: "public-read", // R2 public bucket ise şart değil; private ise signed URL gerekir.
  });
  await r2.send(put);
  return r2PublicUrl(key);
}

export async function r2DeleteObject(key: string) {
  const del = new DeleteObjectCommand({ Bucket: R2_BUCKET!, Key: key });
  await r2.send(del);
}
