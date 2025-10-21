import mongoose, { Schema, models, model } from "mongoose";

export interface IGroupComment {
  post: mongoose.Types.ObjectId;  // GroupPost
  author: mongoose.Types.ObjectId; // User
  text: string;
  likes?: mongoose.Types.ObjectId[];
}

const schema = new Schema<IGroupComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: "GroupPost", index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", index: true },
    text: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export default (models.GroupComment as mongoose.Model<IGroupComment>) || model<IGroupComment>("GroupComment", schema);
