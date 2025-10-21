import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const ACCOUNT = process.env.R2_ACCOUNT_ID || "";
export const R2_PUBLIC_BASE = process.env.R2_PUBLIC_BASE || "";

export const r2 = new S3Client({
  region: "auto",
  endpoint: ACCOUNT ? `https://${ACCOUNT}.r2.cloudflarestorage.com` : undefined,
  credentials: process.env.R2_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      }
    : undefined,
});

export async function putBufferToR2(
  buf: Buffer,
  mime: string,
  key: string,
): Promise<string> {
  if (!process.env.R2_BUCKET) throw new Error("R2_BUCKET missing");
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: buf,
      ContentType: mime,
    }),
  );
  return R2_PUBLIC_BASE ? `${R2_PUBLIC_BASE}/${key}` : key;
}

