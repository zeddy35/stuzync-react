import mongoose, { Schema, models, model } from "mongoose";

const badgeSchema = new Schema(
  {
    key: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
  },
  { timestamps: true }
);

export default models.Badge || model("Badge", badgeSchema);
