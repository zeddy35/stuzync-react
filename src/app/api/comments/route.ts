import { dbConnect } from "@/lib/db";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  if (!postId) return new Response("Missing postId", { status: 400 });
  await dbConnect();
  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: 1 })
    .populate({ path: "author", select: "firstName lastName profilePic" })
    .lean();
  return Response.json({ comments });
}

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
  try {
    if (String(post.author) !== String((session as any).user.id)) {
      await Notification.create({ user: post.author as any, actor: (session as any).user.id, type: "comment", post: post._id, comment: c._id });
    }
  } catch {}

  return Response.json({ ok: true, commentId: c._id });
}
