import mongoose, { Schema, type Document, type Types } from 'mongoose';

export type AssetType = 'image' | 'pdf';
export type Variant = { key: string; width: number; size: number };

export interface IAsset extends Document<Types.ObjectId> {
  ownerId: Types.ObjectId;
  type: AssetType;
  mime: string;
  size: number;
  hash: string;
  r2Key: string;
  variants?: Variant[];
  refMasterId?: Types.ObjectId | null;
  refCount: number;
  totalSizeBytes: number;
  createdAt: Date;
}

const VariantSchema = new Schema<Variant>({ key: String, width: Number, size: Number }, { _id: false });

const AssetSchema = new Schema<IAsset>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    type: { type: String, enum: ['image', 'pdf'], required: true },
    mime: { type: String, required: true },
    size: { type: Number, required: true },
    hash: { type: String, index: true, required: true },
    r2Key: { type: String, required: true },
    variants: { type: [VariantSchema], default: [] },
    refMasterId: { type: Schema.Types.ObjectId, ref: 'Asset', default: null },
    refCount: { type: Number, default: 1, min: 0 },
    totalSizeBytes: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AssetSchema.index({ hash: 1, type: 1 });

export const Asset = mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);

