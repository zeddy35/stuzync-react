import path from "node:path";
import fs from "node:fs";
import { IncomingForm, File } from "formidable";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = new Set([
  "image/jpeg","image/png","image/gif",
  "application/pdf",
  "video/mp4","video/webm","video/quicktime","video/x-matroska",
]);

export function parseMultipart(req: Request): Promise<{ fields: any; files: Record<string, File[]> }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      multiples: true,
      uploadDir: UPLOAD_DIR, // temp
      keepExtensions: true,
      maxFileSize: 20 * 1024 * 1024,
      filename: (_n, _e, part) => `${Date.now()}_${(part.originalFilename || "file").replace(/\s+/g,"_")}`,
      filter: (part) => !part.mimetype || ALLOWED.has(part.mimetype),
    });
    form.parse(req as any, (err, fields, files) => err ? reject(err) : resolve({ fields, files: files as any }));
  });
}

export function publicUrlFromSavedLocal(filePath: string) {
  const base = path.basename(filePath);
  return `/uploads/${base}`;
}

// ---------- R2 driver ----------
let s3: any = null;
function getS3() {
  if (s3) return s3;
  const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
  s3 = { S3Client, PutObjectCommand };
  return s3;
}

export async function putFileLocal(f: File) {
  // Zaten formidable temp’e yazdı → sadece public URL döndür
  return { url: publicUrlFromSavedLocal(f.filepath), key: path.basename(f.filepath) };
}

export async function putFileR2(f: File) {
  const { S3Client, PutObjectCommand } = getS3();
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  const key = `${Date.now()}_${path.basename(f.originalFilename || "file")}`.replace(/\s+/g,"_");
  const Body = fs.readFileSync(f.filepath);
  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    Body,
    ContentType: f.mimetype || "application/octet-stream",
    ACL: undefined, // R2 public bucket ise gerek yok; presigned URL de kullanabilirsin
  }));

  // Public base ile URL üret
  const base = (process.env.R2_PUBLIC_BASE || "").replace(/\/+$/,"");
  const url = `${base}/${key}`;
  return { url, key };
}

// Tek giriş noktası
export async function putFile(f: File) {
  const mode = (process.env.STORAGE || "local").toLowerCase();
  return mode === "r2" ? putFileR2(f) : putFileLocal(f);
}
