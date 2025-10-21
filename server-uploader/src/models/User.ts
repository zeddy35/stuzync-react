import mongoose, { Schema, type Document, type Types } from 'mongoose';
import { env } from '../config/env';

export interface IUser extends Document<Types.ObjectId> {
  quotaBytes: number;
  storageUsed: number;
  dailyUploadedBytes: number;
  dailyResetAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    quotaBytes: { type: Number, default: env.USER_QUOTA_MB * 1024 * 1024, min: 0 },
    storageUsed: { type: Number, default: 0, min: 0 },
    dailyUploadedBytes: { type: Number, default: 0, min: 0 },
    dailyResetAt: { type: Date, default: () => new Date(Date.now() + 24 * 3600 * 1000) },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

