import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
  profilePic?: string;
  profileBanner?: string;
  isVerified: boolean;
  googleId?: string;
  linkedinId?: string;
  verifyToken?: string;
  school?: string;
  favorites: mongoose.Types.ObjectId[]; // Post[]
  roles: string[];                      // 👈 burası 'roles'
  mustCompleteProfile: boolean;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  phone:     String,
  password:  String,
  profilePic: String,
  profileBanner: String,
  school:    String,
  isVerified:{ type: Boolean, default: false },
  googleId:  String,
  linkedinId:String,
  verifyToken:String,
  favorites: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  roles:     { type: [String], default: ["user"] }, // 👈
  mustCompleteProfile: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.set("toJSON", {
  transform(_doc, ret: any) {
    if (ret.password !== undefined) delete ret.password;
    if (ret.verifyToken !== undefined) delete ret.verifyToken;
    return ret;
  }
});

export default models.User || model<IUser>("User", userSchema);
