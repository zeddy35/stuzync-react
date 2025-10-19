// src/app/groups/[id]/posts/[postId]/like/route.ts
export const runtime = "nodejs";

import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import GroupMembership from "@/models/GroupMembership";
import GroupPost from "@/models/GroupPost";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; postId: string } }
) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { id, postId } = params;
  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(postId)) {
    return new Response("Invalid id", { status: 400 });
  }

  const isMember = await GroupMembership.exists({
    group: id,
    user: (session as any).user.id,
  });
  if (!isMember) return new Response("Forbidden", { status: 403 });

  const me = new mongoose.Types.ObjectId((session as any).user.id);
  const post = await GroupPost.findById(postId);
  if (!post || String(post.group) !== id) return new Response("Not found", { status: 404 });

  // ✅ tell TS what 'u' is
  const liked = post.likes.some((u: mongoose.Types.ObjectId) => String(u) === String(me));

  await GroupPost.updateOne(
    { _id: postId },
    liked ? { $pull: { likes: me } } : { $addToSet: { likes: me } }
  );

  const updated = await GroupPost.findById(postId).select("likes").lean<{ likes: mongoose.Types.ObjectId[] } | null>();
  return Response.json({ ok: true, liked: !liked, likes: updated?.likes?.length ?? 0 });
}
