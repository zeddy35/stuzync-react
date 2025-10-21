import mongoose, { Schema, models, model } from "mongoose";

export interface IGroupPost {
  group: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;  // User
  content: string;
  fileUrl?: string;                 // R2 URL (ops.)
  files?: string[];                 // multiple images
  isFlagged: boolean;
  likes: mongoose.Types.ObjectId[]; // User[]
  comments?: mongoose.Types.ObjectId[]; // GroupComment[]
}

const groupPostSchema = new Schema<IGroupPost>(
  {
    group:   { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    author:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, default: "" },
    fileUrl: String,
    files:   { type: [String], default: [] },
    isFlagged: { type: Boolean, default: false },
    likes:   [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments:[{ type: Schema.Types.ObjectId, ref: "GroupComment" }],
  },
  { timestamps: true }
);

export default models.GroupPost || model<IGroupPost>("GroupPost", groupPostSchema);
