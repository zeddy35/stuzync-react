// src/app/api/favorites/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  const { postId } = await req.json();
  await User.findByIdAndUpdate((session as any).user.id, { $addToSet: { favorites: postId } });
  return Response.json({ ok: true });
}
