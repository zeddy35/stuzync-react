import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Notification from "@/models/Notification";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const me = (session as any).user.id;
  if (me === params.id) return new Response("Cannot follow yourself", { status: 400 });
  await dbConnect();
  await User.updateOne({ _id: me }, { $addToSet: { following: params.id } });
  await User.updateOne({ _id: params.id }, { $addToSet: { followers: me } });
  try { await Notification.create({ user: params.id as any, actor: me, type: "follow" }); } catch {}
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const me = (session as any).user.id;
  if (me === params.id) return new Response("Cannot unfollow yourself", { status: 400 });
  await dbConnect();
  await User.updateOne({ _id: me }, { $pull: { following: params.id } });
  await User.updateOne({ _id: params.id }, { $pull: { followers: me } });
  return Response.json({ ok: true });
}
