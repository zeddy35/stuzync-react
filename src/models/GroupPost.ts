import mongoose, { Schema, models, model } from "mongoose";

export interface IGroupPost {
  group: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;  // User
  content: string;
  fileUrl?: string;                 // R2 URL (ops.)
  isFlagged: boolean;
  likes: mongoose.Types.ObjectId[]; // User[]
}

const groupPostSchema = new Schema<IGroupPost>(
  {
    group:   { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    author:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, default: "" },
    fileUrl: String,
    isFlagged: { type: Boolean, default: false },
    likes:   [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default models.GroupPost || model<IGroupPost>("GroupPost", groupPostSchema);
