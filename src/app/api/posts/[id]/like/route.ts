import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import Notification from "@/models/Notification";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  const userId = (session as any).user.id;
  const post = await Post.findByIdAndUpdate(
    params.id,
    { $addToSet: { likes: userId } },
    { new: true }
  ).select("likes");
  if (!post) return new Response("Not found", { status: 404 });
  try {
    const p = await Post.findById(params.id).select("author");
    if (p && String(p.author) !== String(userId)) {
      await Notification.create({ user: p.author, actor: userId, type: "like", post: p._id });
    }
  } catch {}
  return Response.json({ liked: true, likes: post.likes.length });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  const userId = (session as any).user.id;
  const post = await Post.findByIdAndUpdate(
    params.id,
    { $pull: { likes: userId } },
    { new: true }
  ).select("likes");
  if (!post) return new Response("Not found", { status: 404 });
  return Response.json({ liked: false, likes: post.likes.length });
}
