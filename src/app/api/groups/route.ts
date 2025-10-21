import { dbConnect } from "@/lib/db";
import Group from "@/models/Group";
import GroupMembership from "@/models/GroupMembership";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  const me = new mongoose.Types.ObjectId((session as any).user.id);
  const memberships = await GroupMembership.find({ user: me }).select("group").lean<{ group: mongoose.Types.ObjectId }[]>();
  const ids = memberships.map((m) => m.group);
  if (ids.length === 0) return Response.json({ groups: [] });
  const groups = await Group.find({ _id: { $in: ids } }).select("name description cover").lean();
  // memberCount aggregate
  const counts = await GroupMembership.aggregate([{ $match: { group: { $in: ids } } }, { $group: { _id: "$group", c: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((r: any) => [String(r._id), r.c]));
  const data = groups.map((g: any) => ({ ...g, memberCount: countMap.get(String(g._id)) || 0 }));
  return Response.json({ groups: data });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const { name, description, privacy } = await req.json();
  if (!name?.trim()) return new Response("Missing name", { status: 400 });

  const owner = (session as any).user.id;
  const group = await Group.create({
    name: name.trim(),
    description: description?.trim() || "",
    visibility: privacy === "private" ? "private" : "public",
    owner,
  });
  await GroupMembership.create({ group: group._id, user: owner, role: "owner" });

  return Response.json({ ok: true, id: String(group._id) });
}
