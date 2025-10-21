import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Group from "@/models/Group";
import GroupMembership from "@/models/GroupMembership";
import mongoose from "mongoose";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  if (!mongoose.isValidObjectId(params.id)) return new Response("Bad id", { status: 400 });
  const group = await Group.findById(params.id).select("visibility");
  if (!group) return new Response("Not found", { status: 404 });
  if (group.visibility !== "public") return new Response("Forbidden", { status: 403 });
  await GroupMembership.updateOne({ group: group._id, user: (session as any).user.id }, { $setOnInsert: { role: "member" } }, { upsert: true });
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  await GroupMembership.deleteOne({ group: params.id, user: (session as any).user.id });
  return Response.json({ ok: true });
}

