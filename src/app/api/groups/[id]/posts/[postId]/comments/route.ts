import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import GroupPost from "@/models/GroupPost";
import GroupComment from "@/models/GroupComment";
import GroupMembership from "@/models/GroupMembership";
import mongoose from "mongoose";

export async function GET(_req: Request, { params }: { params: { id: string, postId: string } }) {
  await dbConnect();
  if (!mongoose.isValidObjectId(params.id) || !mongoose.isValidObjectId(params.postId)) return new Response("Bad id", { status: 400 });
  const comments = await GroupComment.find({ post: params.postId })
    .sort({ createdAt: 1 })
    .populate({ path: 'author', select: 'firstName lastName profilePic' })
    .lean();
  return Response.json({ comments });
}

export async function POST(req: Request, { params }: { params: { id: string, postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  if (!mongoose.isValidObjectId(params.id) || !mongoose.isValidObjectId(params.postId)) return new Response("Bad id", { status: 400 });
  const me = new mongoose.Types.ObjectId((session as any).user.id);
  const member = await GroupMembership.exists({ group: params.id, user: me });
  if (!member) return new Response("Forbidden", { status: 403 });
  const { text } = await req.json();
  if (!text?.trim()) return new Response("Empty", { status: 400 });
  const c = await GroupComment.create({ post: params.postId, author: me, text: text.trim() });
  await GroupPost.updateOne({ _id: params.postId }, { $addToSet: { comments: c._id } });
  return Response.json({ ok: true, commentId: c._id });
}

