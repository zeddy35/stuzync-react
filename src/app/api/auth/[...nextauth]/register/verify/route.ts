import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return new Response("Missing token", { status: 400 });
  const user = await User.findOne({ verifyToken: token });
  if (!user) return new Response("Invalid token", { status: 400 });
  user.isVerified = true; user.verifyToken = null; await user.save();
  return new Response(null, { status: 302, headers: { Location: "/login?verified=1" } });
}
