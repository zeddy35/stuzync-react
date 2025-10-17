export const runtime = "nodejs";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  await dbConnect();
  const { name, email, password } = await req.json();
  if (!name || !email || !password) return new Response("Missing fields", { status: 400 });
  const exists = await User.findOne({ email });
  if (exists) return new Response("Email in use", { status: 409 });
  const hash = await bcrypt.hash(password, 10);
  const verifyToken = crypto.randomBytes(32).toString("hex");
  await User.create({ name, email, password: hash, verifyToken, isVerified: false });
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const link = `${base}/api/auth/verify?token=${verifyToken}`;
  await sendVerificationEmail(email, link);
  return new Response("OK");
}
