import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import { redisGet, redisSet } from "@/lib/redis";

export const runtime = "nodejs";

export async function GET() {
  const cacheKey = 'popular-tags:v1';
  const cached = await redisGet<any>(cacheKey);
  if (cached) return Response.json({ tags: cached });

  await dbConnect();
  const popular = await Post.aggregate([
    { $match: { isFlagged: false } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  await redisSet(cacheKey, popular as any, 300);
  return Response.json({ tags: popular });
}
