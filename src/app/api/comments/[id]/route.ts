import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Comment from "@/models/Comment";
import Post from "@/models/Post";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const c = await Comment.findById(params.id).select("author post");
  if (!c) return new Response("Not found", { status: 404 });
  if (String(c.author) !== String((session as any).user.id)) return new Response("Forbidden", { status: 403 });

  await Comment.deleteOne({ _id: c._id });
  if (c.post) {
    await Post.updateOne({ _id: c.post }, { $pull: { comments: c._id } });
  }
  return Response.json({ ok: true });
}

