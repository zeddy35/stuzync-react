import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  await dbConnect();
  const { content, tags, groupId } = await req.json();
  if (!content?.trim()) return new Response("Empty", { status: 400 });

  const post = await Post.create({
    author: (session as any).user.id,
    content: content.trim(),
    tags: (tags || []).map((t: string)=> t.toLowerCase().trim()).filter(Boolean),
    group: groupId || undefined,
  });

  return Response.json({ ok: true, id: String(post._id) });
}
