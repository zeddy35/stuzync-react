import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) return new Response("Bad id", { status: 400 });
  await dbConnect();
  const me = new mongoose.Types.ObjectId((session as any).user.id);
  const user = await User.findById(me).select("favorites");
  if (!user) return new Response("Unauthorized", { status: 401 });
  const has = user.favorites.some((p) => String(p) === params.id);
  if (has) await User.updateOne({ _id: me }, { $pull: { favorites: params.id } });
  else await User.updateOne({ _id: me }, { $addToSet: { favorites: params.id } });
  const updated = await User.findById(me).select("favorites");
  return Response.json({ ok: true, favored: !has, count: updated?.favorites.length || 0 });
}

