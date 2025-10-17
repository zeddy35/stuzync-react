import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const me = String((session as any).user.id);
  const post = await Post.findById(params.id);
  if (!post || post.isFlagged) return new Response("Not found", { status: 404 });

  const liked = post.likes.some((id) => String(id) === me);
  await Post.findByIdAndUpdate(
    params.id,
    liked ? { $pull: { likes: me } } : { $push: { likes: me } }
  );
  return Response.json({ ok: true, liked: !liked });
}
