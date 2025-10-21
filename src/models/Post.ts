import mongoose, { Schema, models, model } from "mongoose";

export interface IPost {
  author: mongoose.Types.ObjectId;
  content: string;
  fileUrl?: string;         // legacy single attachment
  files?: string[];         // multiple image attachments
  isFlagged: boolean;
  tags: string[];
  likes: mongoose.Types.ObjectId[];
  sharedFrom?: mongoose.Types.ObjectId;
  group?: mongoose.Types.ObjectId;   // Group feed support
  comments: mongoose.Types.ObjectId[]; // Comment[]
}

const postSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, default: "" },
    fileUrl: { type: String },
    files: { type: [String], default: [] },
    isFlagged: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sharedFrom: { type: Schema.Types.ObjectId, ref: "Post" },
    group: { type: Schema.Types.ObjectId, ref: "Group" },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

postSchema.index({ group: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

export default (models.Post as mongoose.Model<IPost>) || model<IPost>("Post", postSchema);

