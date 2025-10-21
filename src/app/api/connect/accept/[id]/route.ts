import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Notification from "@/models/Notification";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const meId = String((session as any).user.id);
  const requesterId = String(params.id);

  const me = await User.findById(meId).select("friendRequestsReceived");
  const received = (me?.friendRequestsReceived || []).some((x: any) => String(x) === requesterId);
  if (!received) return new Response("No request", { status: 400 });

  await User.findByIdAndUpdate(meId, { $addToSet: { friends: requesterId }, $pull: { friendRequestsReceived: requesterId } });
  await User.findByIdAndUpdate(requesterId, { $addToSet: { friends: meId }, $pull: { friendRequestsSent: meId } });
  try { await Notification.create({ user: requesterId as any, actor: meId as any, type: "zync" }); } catch {}
  return Response.json({ ok: true });
}
