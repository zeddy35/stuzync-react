import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const post = await Post.findById(params.id)
    .populate("author", "name profilePic isAdmin")
    .populate({ path: "sharedFrom", populate: { path: "author", select: "name profilePic" } })
    .populate({ path: "comments", populate: { path: "author", select: "name profilePic" } });
  if (!post) return new Response("Not found", { status: 404 });
  const session = await getServerSession(authOptions);
  const isOwner = session?.user && String((session as any).user.id) === String(post.author?._id);
  if (post.isFlagged && !(isOwner || (session as any)?.user?.isAdmin)) {
    return new Response("Flagged", { status: 403 });
  }
  return Response.json({ post });
}
