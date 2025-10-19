import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";

export const runtime = "nodejs";

export async function GET() {
  await dbConnect();
  const popular = await Post.aggregate([
    { $match: { isFlagged: false } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  return Response.json({ tags: popular });
}
