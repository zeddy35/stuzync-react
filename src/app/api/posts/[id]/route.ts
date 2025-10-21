import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const post = await Post.findById(params.id).select("author comments");
  if (!post) return new Response("Not found", { status: 404 });
  if (String(post.author) !== String((session as any).user.id)) return new Response("Forbidden", { status: 403 });

  // delete post and its comments
  await Comment.deleteMany({ _id: { $in: post.comments } });
  await Post.deleteOne({ _id: post._id });
  return Response.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const content = String(body.content ?? "").trim();
  if (!content) return new Response("Empty", { status: 400 });

  const post = await Post.findById(params.id).select("author");
  if (!post) return new Response("Not found", { status: 404 });
  if (String(post.author) !== String((session as any).user.id)) return new Response("Forbidden", { status: 403 });

  await Post.updateOne({ _id: params.id }, { $set: { content } });
  return Response.json({ ok: true });
}
