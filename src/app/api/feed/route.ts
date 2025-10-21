import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10) || 20, 50);

  const query: any = { group: { $exists: false } };
  if (cursor) {
    try { query._id = { $lt: cursor }; } catch {}
  }

  const posts = await Post.find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .populate({ path: "author", select: "firstName lastName profilePic" })
    .lean();

  const nextCursor = posts.length === limit ? String(posts[posts.length - 1]._id) : null;
  return Response.json({ posts, nextCursor });
}
