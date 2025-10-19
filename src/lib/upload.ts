// src/lib/upload.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "node:crypto";

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
  R2_PUBLIC_BASE,
} = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  throw new Error("R2 env missing");
}

/** R2 S3-compatible client */
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
});

export async function putBufferToR2(buf: Buffer, mime: string, folder = "uploads") {
  const key = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buf,
      ContentType: mime || "application/octet-stream",
      // ACL: "public-read"  // ⚠️ R2 çoğunlukla ACL desteklemez; public erişimi bucket policy/CDN ile ver.
    })
  );

  const url = R2_PUBLIC_BASE
    ? `${R2_PUBLIC_BASE}/${key}`
    : `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`;

  return { key, url };
}

type FileFromFormOpts = {
  prefix?: string;                 // klasör adı
  allow?: string[];                // ["image/","video/"] gibi mime prefixleri
  maxSizeMB?: number;              // default 10
};

/** FormData içinden dosyayı çek, kontrol et, R2’ya yükle */
export async function fileFromForm(
  form: FormData,
  field: string,
  opts: FileFromFormOpts = {}
): Promise<null | { key: string; url: string; mime: string; size: number }> {
  const f = form.get(field);
  if (!f || !(f instanceof File)) return null;

  const mime = f.type || "application/octet-stream";
  const size = f.size || 0;

  // tip kontrol
  if (opts.allow?.length) {
    const ok = opts.allow.some((prefix) => mime.startsWith(prefix));
    if (!ok) throw new Error(`Unsupported file type: ${mime}`);
  }

  // boyut kontrol
  const maxSizeMB = opts.maxSizeMB ?? 10;
  if (size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File is too large. Max ${maxSizeMB}MB`);
  }

  // buffer’a çevir ve yükle
  const ab = await f.arrayBuffer();
  const buf = Buffer.from(ab);
  const folder = opts.prefix || "uploads";
  const { key, url } = await putBufferToR2(buf, mime, folder);
  return { key, url, mime, size };
}
