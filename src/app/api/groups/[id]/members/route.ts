import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import GroupMembership from "@/models/GroupMembership";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  if (!mongoose.isValidObjectId(params.id)) return new Response("Bad id", { status: 400 });
  const me = new mongoose.Types.ObjectId((session as any).user.id);
  const myMembership = await GroupMembership.findOne({ group: params.id, user: me }).select("role").lean<{ role: "admin" | "moderator" | "member" } | null>();
  if (!myMembership) return new Response("Forbidden", { status: 403 });
  const members = await GroupMembership.find({ group: params.id })
    .populate({ path: "user", select: "firstName lastName profilePic" })
    .select("role user")
    .lean<{ role: "admin" | "moderator" | "member"; user: any }[]>();
  const data = members.map((m) => ({
    _id: String(m.user?._id || ""),
    name: `${m.user?.firstName || ""} ${m.user?.lastName || ""}`.trim(),
    role: m.role,
    avatar: m.user?.profilePic || null,
  }));
  const meRole = myMembership.role; const canInvite = meRole === "admin" || meRole === "moderator"; const canSetRoles = meRole === "admin"; return Response.json({ members: data, meRole, canInvite, canSetRoles });
}

