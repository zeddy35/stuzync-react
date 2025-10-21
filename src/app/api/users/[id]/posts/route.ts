import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10) || 10, 50);

  const query: any = { author: params.id };
  if (cursor) {
    try { query._id = { $lt: cursor }; } catch {}
  }

  const posts = await Post.find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .select("content createdAt")
    .lean();

  const nextCursor = posts.length === limit ? String(posts[posts.length - 1]._id) : null;
  return Response.json({ posts, nextCursor });
}

