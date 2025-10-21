import mongoose, { Schema, models, model } from "mongoose";

export interface INotification {
  user: mongoose.Types.ObjectId;      // target user
  actor: mongoose.Types.ObjectId;     // who did it
  type: "like" | "comment" | "follow" | "zync";
  post?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  isRead: boolean;
}

const schema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["like", "comment", "follow", "zync"], required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

schema.index({ user: 1, createdAt: -1 });

export default (models.Notification as mongoose.Model<INotification>) || model<INotification>("Notification", schema);
