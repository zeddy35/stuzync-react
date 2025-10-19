import mongoose, { Schema, models, model } from "mongoose";

export interface IGroupMessage {
  group: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;  // User
  content: string;
}

const groupMessageSchema = new Schema<IGroupMessage>(
  {
    group:  { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content:{ type: String, required: true },
  },
  { timestamps: true }
);

export default models.GroupMessage || model<IGroupMessage>("GroupMessage", groupMessageSchema);
