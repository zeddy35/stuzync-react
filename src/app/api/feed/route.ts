// src/app/api/feed/route.ts
export const runtime = "nodejs";

import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";

export async function GET() {
  try {
    await dbConnect();
    const posts = await Post.find({ isFlagged: false })
      .populate("author", "name profilePic")
      .populate({ path: "sharedFrom", populate: { path: "author", select: "name profilePic" } })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return Response.json({ posts });
  } catch (err: any) {
    console.error("GET /api/feed error:", err?.message || err);
    // Çökmeyelim; boş liste döndür
    return Response.json({ posts: [] }, { status: 200 });
  }
}
