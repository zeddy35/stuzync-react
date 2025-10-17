import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const meId = String((session as any).user.id);
  const targetId = String(params.id);

  if (meId === targetId) return new Response("Self", { status: 400 });

  const me = await User.findById(meId).select("friends friendRequestsSent");
  const alreadyFriend = (me?.friends || []).some((x: any) => String(x) === targetId);
  const alreadyReq = (me?.friendRequestsSent || []).some((x: any) => String(x) === targetId);
  if (alreadyFriend || alreadyReq) return new Response("Already", { status: 200 });

  await User.findByIdAndUpdate(meId, { $addToSet: { friendRequestsSent: targetId } });
  await User.findByIdAndUpdate(targetId, { $addToSet: { friendRequestsReceived: meId } });
  return Response.json({ ok: true });
}
