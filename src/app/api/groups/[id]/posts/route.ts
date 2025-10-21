import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import GroupPost from "@/models/GroupPost";
import GroupMembership from "@/models/GroupMembership";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  await dbConnect();
  if (!mongoose.isValidObjectId(params.id)) return new Response("Bad id", { status: 400 });
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 50);

  const query: any = { group: params.id };
  if (cursor) { query._id = { $lt: cursor }; }

  const posts = await GroupPost.find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .populate({ path: "author", select: "firstName lastName profilePic" })
    .lean();
  const me = (session as any)?.user?.id;
  const shaped = posts.map((p: any) => ({
    ...p,
    likesCount: Array.isArray(p.likes) ? p.likes.length : 0,
    liked: me ? (p.likes || []).some((id: any) => String(id) === String(me)) : false,
    commentCount: Array.isArray(p.comments) ? p.comments.length : 0,
  }));
  const nextCursor = shaped.length === limit ? String(shaped[shaped.length - 1]._id) : null;
  return Response.json({ posts: shaped, nextCursor });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  if (!mongoose.isValidObjectId(params.id)) return new Response("Bad id", { status: 400 });
  const me = new mongoose.Types.ObjectId((session as any).user.id);
  const isMember = await GroupMembership.exists({ group: params.id, user: me });
  if (!isMember) return new Response("Forbidden", { status: 403 });
  const body = await req.json().catch(() => ({}));
  const content = String(body.content || "").trim();
  const fileUrl = String(body.fileUrl || "").trim() || undefined;
  const files = Array.isArray(body.files) ? body.files.filter((u: any)=> typeof u === 'string' && u.length>0).slice(0,9) : [];
  if (!content && !fileUrl && files.length===0) return new Response("Empty", { status: 400 });
  const post = await GroupPost.create({ group: params.id, author: me, content, fileUrl, files });
  return Response.json({ ok: true, id: String(post._id) });
}
