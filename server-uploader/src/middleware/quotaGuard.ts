import type { Request, Response, NextFunction } from 'express';
import { bytesFromMB } from '../services/hash';
import { env } from '../config/env';
import { User } from '../models/User';

export async function quotaGuard(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).userId as string;
  const user = await User.findById(userId);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (user.dailyResetAt && user.dailyResetAt.getTime() <= Date.now()) {
    user.dailyUploadedBytes = 0;
    user.dailyResetAt = new Date(Date.now() + 24 * 3600 * 1000);
    await user.save();
  }

  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) return res.status(400).json({ error: 'No file' });

  const incomingBytes = file.size;
  const quotaBytes = user.quotaBytes;
  const dailyCap = bytesFromMB(env.DAILY_UPLOAD_MB);

  const usedAfter = user.storageUsed + incomingBytes;
  const dailyAfter = user.dailyUploadedBytes + incomingBytes;

  if (usedAfter > quotaBytes) return res.status(403).json({ error: 'Quota exceeded' });
  if (dailyAfter > dailyCap) return res.status(403).json({ error: 'Daily upload cap reached' });

  const warn = usedAfter / quotaBytes;
  if (warn >= 0.9) res.setHeader('X-Quota-Warn', '0.9');
  else if (warn >= 0.8) res.setHeader('X-Quota-Warn', '0.8');

  (req as any).userDoc = user;
  next();
}

