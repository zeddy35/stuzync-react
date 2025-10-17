import mongoose, { Schema, models, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String }, // OAuth-only için boş olabilir
    school: { type: String },
    phone: { type: String },
    bio: { type: String },
    profilePic: { type: String },
    profileBanner: { type: String }, // ✅ yeni alan
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    googleId: { type: String },
    githubId: { type: String },
    verifyToken: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendRequestsSent: [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendRequestsReceived: [{ type: Schema.Types.ObjectId, ref: "User" }],
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    badges: [{ type: Schema.Types.ObjectId, ref: "Badge" }],
    headline: { type: String },
    social: {
      linkedin: String, github: String, instagram: String, website: String,
    },
    mustCompleteProfile: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.User || model("User", userSchema);
