// src/app/api/favorites/[id]/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  await User.findByIdAndUpdate((session as any).user.id, { $pull: { favorites: params.id } });
  return Response.json({ ok: true });
}
