import { dbConnect } from "@/lib/db";
import Group from "@/models/Group";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const { name, description, privacy } = await req.json();
  if (!name?.trim()) return new Response("Missing name", { status: 400 });

  const owner = (session as any).user.id;
  const group = await Group.create({
    name: name.trim(),
    description: description?.trim() || "",
    privacy: privacy === "private" ? "private" : "public",
    owner,
    admins: [owner],
    members: [owner],
  });

  return Response.json({ ok: true, id: String(group._id) });
}
