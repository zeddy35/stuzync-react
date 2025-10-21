import { dbConnect } from "@/lib/db";
import Group from "@/models/Group";
import GroupMembership from "@/models/GroupMembership";
import { redisGet, redisSet } from "@/lib/redis";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const cacheKey = 'groups:public:v1';
  const cached = await redisGet<any>(cacheKey);
  if (cached) return Response.json({ groups: cached });

  await dbConnect();
  const groups = await Group.find({ visibility: "public" }).select("name description cover avatar").limit(20).lean();
  const ids = groups.map((g: any) => g._id);
  const memberCounts = await GroupMembership.aggregate([{ $match: { group: { $in: ids } } }, { $group: { _id: "$group", c: { $sum: 1 } } }]);
  const countMap = new Map(memberCounts.map((r: any) => [String(r._id), r.c]));
  const shaped = groups.map((g: any) => ({ ...g, memberCount: countMap.get(String(g._id)) || 0 }));
  await redisSet(cacheKey, shaped as any, 60);
  return Response.json({ groups: shaped });
}
