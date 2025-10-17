import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const original = await Post.findById(params.id);
  if (!original || original.isFlagged) return new Response("Not found", { status: 404 });

  await Post.create({
    author: (session as any).user.id,
    content: "",
    sharedFrom: original._id,
    isFlagged: false,
  });

  return Response.json({ ok: true });
}
