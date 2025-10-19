import { dbConnect } from "@/lib/db";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const { postId, text } = await req.json();
  if (!text?.trim()) return new Response("Empty", { status: 400 });

  const post = await Post.findById(postId);
  if (!post || post.isFlagged) return new Response("Not found", { status: 404 });

  const c = await Comment.create({
    post: post._id,
    author: (session as any).user.id,
    text: text.trim(),
  });
  post.comments.push(c._id);
  await post.save();

  return Response.json({ ok: true, commentId: c._id });
}
