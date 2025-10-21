import mongoose, { Schema, model, models, type Types } from "mongoose";

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
  githubId?: string;
  verifyToken?: string;
  school?: string;

  bio?: string;
  skills?: string[];
  interests?: string[];
  badges?: Types.ObjectId[];

  favorites: Types.ObjectId[];       // Post[]
  roles: string[];                   // ["user","admin"]
  mustCompleteProfile: boolean;
  friends?: Types.ObjectId[];
  friendRequestsSent?: Types.ObjectId[];
  friendRequestsReceived?: Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    phone:     { type: String },
    password:  { type: String },
    profilePic:    { type: String },
    profileBanner: { type: String },
    school:        { type: String },

    bio:        { type: String, default: "" },
    skills:     { type: [String], default: [] },
    interests:  { type: [String], default: [] },
    badges:     [{ type: Schema.Types.ObjectId, ref: "Badge" }],

    isVerified:    { type: Boolean, default: false },
    googleId:      { type: String },
    githubId:      { type: String },
    verifyToken:   { type: String },
    favorites:     [{ type: Schema.Types.ObjectId, ref: "Post" }],
    roles:         { type: [String], default: ["user"] },
    mustCompleteProfile: { type: Boolean, default: true },
    followers:     [{ type: Schema.Types.ObjectId, ref: "User" }],
    following:     [{ type: Schema.Types.ObjectId, ref: "User" }],
    zyncCount:     { type: Number, default: 0 },
    friends:               [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendRequestsSent:    [{ type: Schema.Types.ObjectId, ref: "User" }],
    friendRequestsReceived:[{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

UserSchema.set("toJSON", {
  transform(_doc, ret) {
    if (ret.password !== undefined) delete ret.password;
    if (ret.verifyToken !== undefined) delete ret.verifyToken;
    return ret;
  },
});

export default (models.User as mongoose.Model<IUser>) || model<IUser>("User", UserSchema);
