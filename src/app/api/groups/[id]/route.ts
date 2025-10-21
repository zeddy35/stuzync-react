import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Group from "@/models/Group";
import GroupMembership from "@/models/GroupMembership";
import GroupPost from "@/models/GroupPost";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  if (!mongoose.isValidObjectId(params.id)) return new Response("Bad id", { status: 400 });
  const group = await Group.findById(params.id).lean();
  if (!group) return new Response("Not found", { status: 404 });
  const memberCount = await GroupMembership.countDocuments({ group: group._id });
  return Response.json({ group: { ...group, memberCount } });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  if (!mongoose.isValidObjectId(params.id)) return new Response("Bad id", { status: 400 });
  const me = new mongoose.Types.ObjectId((session as any).user.id);
  const isMember = await GroupMembership.exists({ group: params.id, user: me });
  if (!isMember) return new Response("Forbidden", { status: 403 });
  const body = await req.json().catch(() => ({}));
  const content = String(body.content || "").trim();
  const fileUrl = String(body.fileUrl || "").trim() || undefined;
  if (!content && !fileUrl) return new Response("Empty", { status: 400 });
  const post = await GroupPost.create({ group: params.id, author: me, content, fileUrl });
  return Response.json({ ok: true, id: String(post._id) });
}

