import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import mongoose from 'mongoose';

export async function auth(req: Request, _res: Response, next: NextFunction) {
  let uid = (req.headers['x-demo-user-id'] as string) || '';
  if (!uid || !mongoose.isValidObjectId(uid)) {
    const first = await User.findOne().select('_id');
    if (first) uid = String(first._id);
    else {
      const u = await User.create({});
      uid = String(u._id);
    }
  }
  (req as any).userId = uid;
  next();
}

