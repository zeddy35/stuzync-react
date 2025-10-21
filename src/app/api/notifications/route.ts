import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  const list = await Notification.find({ user: (session as any).user.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate({ path: "actor", select: "firstName lastName profilePic" })
    .lean();
  return Response.json({ notifications: list });
}

export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  await Notification.updateMany({ user: (session as any).user.id, isRead: false }, { $set: { isRead: true } });
  return Response.json({ ok: true });
}

