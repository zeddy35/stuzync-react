import { PutObjectCommand, DeleteObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '../config/r2';
import { env } from '../config/env';

export async function r2PutObject(key: string, body: Buffer, mime: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: mime,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );
}

export async function r2DeleteMany(keys: string[]) {
  if (keys.length === 0) return;
  await s3.send(
    new DeleteObjectsCommand({
      Bucket: env.R2_BUCKET,
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    })
  );
}

export function getPublicUrl(key: string, versionParam = true): string {
  const base = env.R2_PUBLIC_BASE_URL.replace(/\/+$/, '');
  return versionParam ? `${base}/${key}?v=${Date.now()}` : `${base}/${key}`;
}

export async function getSignedUrlForKey(key: string, ttlSec = env.SIGNED_URL_TTL_SEC) {
  const cmd = new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: key, ResponseCacheControl: 'public, max-age=31536000, immutable' });
  return getSignedUrl(s3, cmd, { expiresIn: ttlSec });
}

