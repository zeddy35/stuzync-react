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

  // Cancel outgoing request
  await User.findByIdAndUpdate(meId, { $pull: { friendRequestsSent: targetId } });
  await User.findByIdAndUpdate(targetId, { $pull: { friendRequestsReceived: meId } });
  return Response.json({ ok: true });
}

