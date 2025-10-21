import type { Request, Response } from 'express';
import { z } from 'zod';
import { hashBufferSHA256 } from '../services/hash';
import { createWebpVariant, IMAGE_VARIANTS } from '../services/image';
import { r2PutObject, r2DeleteMany, getSignedUrlForKey, getPublicUrl } from '../services/storage';
import { Asset } from '../models/Asset';
import { User } from '../models/User';
import crypto from 'crypto';

const UploadQuery = z.object({ visibility: z.enum(['private', 'public']).optional().default('private') });

function randomKey(prefix = 'uploads'): string {
  return `${prefix}/${new Date().toISOString().slice(0, 10)}/${crypto.randomBytes(12).toString('hex')}`;
}

export async function uploadHandler(req: Request, res: Response) {
  const user = (req as any).userDoc as InstanceType<typeof User>;
  const kind = (req as any).fileKind as 'image' | 'pdf';
  const parsed = UploadQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Bad query' });
  const { visibility } = parsed.data;

  const file = (req as any).file as Express.Multer.File;
  const buf = file.buffer;
  const hash = hashBufferSHA256(buf);

  const master = await Asset.findOne({ hash, type: kind, refMasterId: null });
  if (master) {
    const ref = await Asset.create({
      ownerId: user._id,
      type: kind,
      mime: file.mimetype,
      size: file.size,
      hash,
      r2Key: master.r2Key,
      variants: master.variants,
      refMasterId: master._id,
      refCount: 0,
      totalSizeBytes: master.totalSizeBytes,
    });
    await Asset.updateOne({ _id: master._id }, { $inc: { refCount: 1 } });
    const urls =
      visibility === 'private'
        ? {
            original: await getSignedUrlForKey(master.r2Key),
            variants: await Promise.all((master.variants || []).map(async (v) => ({ key: v.key, url: await getSignedUrlForKey(v.key) }))),
          }
        : { original: getPublicUrl(master.r2Key), variants: (master.variants || []).map((v) => ({ key: v.key, url: getPublicUrl(v.key) })) };
    return res.status(201).json({ asset: ref, urls, deduped: true });
  }

  const baseKey = randomKey(kind === 'image' ? 'images' : 'pdfs');
  const originalKey = `${baseKey}/original`;
  let variants: { key: string; width: number; size: number }[] = [];
  try {
    await r2PutObject(originalKey, buf, file.mimetype);
    let totalBytes = buf.length;
    if (kind === 'image') {
      for (const spec of IMAGE_VARIANTS) {
        const out = await createWebpVariant(buf, spec.width);
        const vkey = `${baseKey}/w${spec.width}.webp`;
        await r2PutObject(vkey, out, 'image/webp');
        variants.push({ key: vkey, width: spec.width, size: out.length });
        totalBytes += out.length;
      }
    }

    user.storageUsed += totalBytes;
    user.dailyUploadedBytes += buf.length;
    await user.save();

    const asset = await Asset.create({
      ownerId: user._id,
      type: kind,
      mime: file.mimetype,
      size: buf.length,
      hash,
      r2Key: originalKey,
      variants,
      refMasterId: null,
      refCount: 1,
      totalSizeBytes: totalBytes,
    });

    const urls =
      visibility === 'private'
        ? {
            original: await getSignedUrlForKey(originalKey),
            variants: await Promise.all(variants.map(async (v) => ({ key: v.key, url: await getSignedUrlForKey(v.key) }))),
          }
        : { original: getPublicUrl(originalKey), variants: variants.map((v) => ({ key: v.key, url: getPublicUrl(v.key) })) };

    return res.status(201).json({ asset, urls, deduped: false });
  } catch (e) {
    const keys = [originalKey, ...variants.map((v) => v.key)];
    await r2DeleteMany(keys);
    return res.status(500).json({ error: 'Upload failed' });
  }
}

export async function deleteAssetHandler(req: Request, res: Response) {
  const id = req.params.id;
  const userId = (req as any).userId as string;
  const asset = await Asset.findById(id);
  if (!asset) return res.status(404).json({ error: 'Not found' });
  if (String(asset.ownerId) !== userId && asset.refMasterId == null) return res.status(403).json({ error: 'Forbidden' });

  if (asset.refMasterId) {
    await Asset.deleteOne({ _id: asset._id });
    await Asset.updateOne({ _id: asset.refMasterId }, { $inc: { refCount: -1 } });
    return res.json({ ok: true, deleted: id });
  }

  if (asset.refCount > 1) {
    await Asset.updateOne({ _id: asset._id }, { $inc: { refCount: -1 } });
    return res.json({ ok: true, decremented: true });
  }

  const keys = [asset.r2Key, ...(asset.variants || []).map((v) => v.key)];
  await r2DeleteMany(keys);
  const user = await User.findById(asset.ownerId);
  if (user) {
    user.storageUsed = Math.max(0, user.storageUsed - asset.totalSizeBytes);
    await user.save();
  }
  await Asset.deleteOne({ _id: asset._id });
  return res.json({ ok: true, deleted: id, purged: true });
}

export async function getSignedUrlHandler(req: Request, res: Response) {
  const id = req.params.id;
  const asset = await Asset.findById(id);
  if (!asset) return res.status(404).json({ error: 'Not found' });
  const url = await getSignedUrlForKey(asset.r2Key);
  res.setHeader('Cache-Control', 'private, max-age=60');
  return res.json({ url });
}

