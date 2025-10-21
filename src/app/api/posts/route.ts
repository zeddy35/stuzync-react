import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  await dbConnect();
  const body = await req.json();
  const content = body?.content;
  const tags = body?.tags;
  const groupId = body?.groupId;
  const fileUrl = body?.fileUrl;
  const files = Array.isArray(body?.files) ? body.files.filter((u: any) => typeof u === "string" && u.length > 0).slice(0, 9) : [];
  if (!content?.trim()) return new Response("Empty", { status: 400 });

  const post = await Post.create({
    author: (session as any).user.id,
    content: content.trim(),
    tags: (tags || []).map((t: string)=> t.toLowerCase().trim()).filter(Boolean),
    group: groupId || undefined,
    fileUrl: typeof fileUrl === "string" && fileUrl.length > 0 ? fileUrl : undefined,
    files,
  });

  return Response.json({ ok: true, id: String(post._id) });
}
