// src/lib/upload.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import crypto from "node:crypto";

function readEnv() {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_BASE,
    R2_PUBLIC_CDN_BASE,
    // Uyum: .env.local içinde R2_PUBLIC_BASE_URL kullanılıyor olabilir
    R2_PUBLIC_BASE_URL,
  } = process.env as Record<string, string | undefined>;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) return null;
  // R2_PUBLIC_BASE_URL varsa CDN/base alanı olarak kabul et
  const CDN_BASE = R2_PUBLIC_CDN_BASE || R2_PUBLIC_BASE_URL;
  return { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE, R2_PUBLIC_CDN_BASE: CDN_BASE } as const;
}

let s3: S3Client | null = null;
function getClient() {
  const env = readEnv();
  if (!env) return null;
  if (s3) return s3;
  s3 = new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env.R2_ACCESS_KEY_ID!, secretAccessKey: env.R2_SECRET_ACCESS_KEY! },
  });
  return s3;
}

export async function putBufferToR2(buf: Buffer, mime: string, folder = "uploads") {
  const env = readEnv();
  const client = getClient();
  if (!env || !client) throw new Error("R2 is not configured");
  const key = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  await client.send(new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: key, Body: buf, ContentType: mime || "application/octet-stream", CacheControl: "public, max-age=31536000, immutable" }));
  const base = env.R2_PUBLIC_CDN_BASE || env.R2_PUBLIC_BASE || `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}`;
  const url = `${base}/${key}?v=${Date.now()}`;
  return { key, url };
}

// Optional: signed GET URL for private objects
export async function getSignedGetUrl(key: string, expiresSeconds = 300) {
  const env = readEnv();
  const client = getClient();
  if (!env || !client) throw new Error("R2 is not configured");
  // Dinamik import: paket eksikse derleme kırılsın istemiyoruz; çağrıldığında net hata verelim.
  try {
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    const cmd = new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: key });
    const url = await getSignedUrl(client as any, cmd, { expiresIn: expiresSeconds });
    return { url };
  } catch {
    // Alternatif: herkese açık base üzerinden URL oluştur (özel obje değilse çalışır)
    const base = env.R2_PUBLIC_CDN_BASE || env.R2_PUBLIC_BASE || `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}`;
    const url = `${base}/${key}`;
    return { url };
  }
}

type FileFromFormOpts = {
  prefix?: string;
  allow?: string[];     // e.g., ["image/", "application/pdf"]
  maxSizeMB?: number;   // default 10
};

export async function fileFromForm(
  form: FormData,
  field: string,
  opts: FileFromFormOpts = {}
): Promise<null | { key: string; url: string; mime: string; size: number }> {
  const f = form.get(field);
  if (!f || !(f instanceof File)) return null;

  const mime = f.type || "application/octet-stream";
  const size = f.size || 0;

  if (opts.allow?.length) {
    const ok = opts.allow.some((prefix) => mime.startsWith(prefix) || mime === prefix);
    if (!ok) throw new Error(`Unsupported file type: ${mime}`);
  }

  const maxSizeMB = opts.maxSizeMB ?? 10;
  if (size > maxSizeMB * 1024 * 1024) throw new Error(`File is too large. Max ${maxSizeMB}MB`);

  const ab = await f.arrayBuffer();
  const buf = Buffer.from(ab);
  const folder = opts.prefix || "uploads";
  const { key, url } = await putBufferToR2(buf, mime, folder);
  return { key, url, mime, size };
}
