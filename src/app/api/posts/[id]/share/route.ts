import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import mongoose from "mongoose";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) return new Response("Bad id", { status: 400 });
  await dbConnect();
  const me = new mongoose.Types.ObjectId((session as any).user.id);
  const src = await Post.findById(params.id).select("_id");
  if (!src) return new Response("Not found", { status: 404 });
  const repost = await Post.create({ author: me, content: "", sharedFrom: src._id });
  return Response.json({ ok: true, id: String(repost._id) });
}

