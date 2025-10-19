import mongoose, { Schema, models, model } from "mongoose";

export type GroupVisibility = "public" | "private";

export interface IGroup {
  name: string;
  description?: string;
  visibility: GroupVisibility;
  cover?: string;           // R2 URL
  owner: mongoose.Types.ObjectId; // User
}

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    visibility: { type: String, enum: ["public", "private"], default: "public", index: true },
    cover: String,
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

export default models.Group || model<IGroup>("Group", groupSchema);
