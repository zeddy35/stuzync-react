import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const meId = String((session as any).user.id);
  const requesterId = String(params.id);

  // Remove pending request in both directions
  await User.findByIdAndUpdate(meId, { $pull: { friendRequestsReceived: requesterId } });
  await User.findByIdAndUpdate(requesterId, { $pull: { friendRequestsSent: meId } });
  return Response.json({ ok: true });
}

