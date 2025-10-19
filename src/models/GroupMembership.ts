import mongoose, { Schema, models, model } from "mongoose";

export interface IGroupMembership {
  group: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  role: "owner" | "admin" | "moderator" | "member";
}

const groupMembershipSchema = new Schema<IGroupMembership>(
  {
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true, index: true },
    user:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role:  { type: String, enum: ["owner", "admin", "moderator", "member"], default: "member" },
  },
  { timestamps: true }
);

groupMembershipSchema.index({ group: 1, user: 1 }, { unique: true });

// ➜ Lean dönüş tipi (yalnızca ihtiyaç duyduklarını içer)
export type IGroupMembershipLean = {
  _id: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  role: "owner" | "admin" | "moderator" | "member";
  createdAt?: Date;
  updatedAt?: Date;
};

export default models.GroupMembership || model<IGroupMembership>("GroupMembership", groupMembershipSchema);
