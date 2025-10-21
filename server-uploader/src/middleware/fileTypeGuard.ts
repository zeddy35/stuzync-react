import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { bytesFromMB } from '../services/hash';

export function fileTypeGuard(req: Request, res: Response, next: NextFunction) {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: 'No file' });

  const { mimetype, size } = file;
  const isImage = mimetype.startsWith('image/');
  const isPdf = mimetype === 'application/pdf';
  if (!isImage && !isPdf) return res.status(415).json({ error: 'Unsupported media type' });

  const limit = isImage ? bytesFromMB(env.MAX_IMAGE_MB) : bytesFromMB(env.MAX_PDF_MB);
  if (size > limit) return res.status(413).json({ error: 'File too large' });

  (req as any).fileKind = isImage ? 'image' : 'pdf';
  next();
}

