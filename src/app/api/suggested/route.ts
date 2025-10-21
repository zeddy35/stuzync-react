import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  const me = new mongoose.Types.ObjectId((session as any).user.id);
  const meDoc = await User.findById(me).select("following").lean<{ following?: mongoose.Types.ObjectId[] } | null>();
  const following = (meDoc?.following || []).map((x) => String(x));
  const candidates = await User.find({ _id: { $ne: me } })
    .select("firstName lastName profilePic followers zyncCount")
    .limit(8)
    .lean();
  const list = candidates
    .filter((u: any) => !following.includes(String(u._id)))
    .map((u: any) => ({
      _id: String(u._id),
      name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
      avatar: u.profilePic || null,
      followers: (u.followers || []).length || 0,
      zyncCount: u.zyncCount || 0,
    }));
  return Response.json({ users: list });
}

