import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import GroupPost from "@/models/GroupPost";
import GroupMembership from "@/models/GroupMembership";
import mongoose from "mongoose";

export async function POST(_req: Request, { params }: { params: { id: string; postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  if (!mongoose.isValidObjectId(params.id) || !mongoose.isValidObjectId(params.postId)) return new Response("Bad id", { status: 400 });
  const me = (session as any).user.id;
  const member = await GroupMembership.exists({ group: params.id, user: me });
  if (!member) return new Response("Forbidden", { status: 403 });
  const post = await GroupPost.findByIdAndUpdate(params.postId, { $addToSet: { likes: me } }, { new: true }).select("likes");
  if (!post) return new Response("Not found", { status: 404 });
  return Response.json({ liked: true, likes: post.likes.length });
}

export async function DELETE(_req: Request, { params }: { params: { id: string; postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  if (!mongoose.isValidObjectId(params.id) || !mongoose.isValidObjectId(params.postId)) return new Response("Bad id", { status: 400 });
  const me = (session as any).user.id;
  const member = await GroupMembership.exists({ group: params.id, user: me });
  if (!member) return new Response("Forbidden", { status: 403 });
  const post = await GroupPost.findByIdAndUpdate(params.postId, { $pull: { likes: me } }, { new: true }).select("likes");
  if (!post) return new Response("Not found", { status: 404 });
  return Response.json({ liked: false, likes: post.likes.length });
}

