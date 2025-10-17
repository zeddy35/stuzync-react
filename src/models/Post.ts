import mongoose, { Schema, models, model } from "mongoose";

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String },
    fileUrl: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    sharedFrom: { type: Schema.Types.ObjectId, ref: "Post" },
    isFlagged: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export default models.Post || model("Post", postSchema);
