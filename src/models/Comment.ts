import mongoose, { Schema, models, model } from "mongoose";
export interface IComment {
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  text: string;
}
const commentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", index: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);
export default models.Comment || model<IComment>("Comment", commentSchema);
