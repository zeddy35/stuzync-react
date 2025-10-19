import mongoose, { Schema, models, model } from "mongoose";

export interface IGroupNote {
  group: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId; // User
  title: string;
  content: string;
}

const groupNoteSchema = new Schema<IGroupNote>(
  {
    group:  { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title:  { type: String, required: true, trim: true },
    content:{ type: String, default: "" },
  },
  { timestamps: true }
);

export default models.GroupNote || model<IGroupNote>("GroupNote", groupNoteSchema);
