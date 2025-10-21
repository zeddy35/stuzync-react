import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Group from "@/models/Group";
import Post from "@/models/Post";
import GroupPost from "@/models/GroupPost";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q) return Response.json({ users: [], groups: [], posts: [] });
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const [users, groups, posts1, posts2] = await Promise.all([
    User.find({ $or: [{ firstName: rx }, { lastName: rx }, { email: rx }] })
      .select('firstName lastName profilePic')
      .limit(5)
      .lean(),
    Group.find({ $or: [{ name: rx }, { description: rx }] })
      .select('name description avatar cover visibility')
      .limit(5)
      .lean(),
    Post.find({ content: rx })
      .select('content author')
      .limit(5)
      .populate({ path: 'author', select: 'firstName lastName profilePic' })
      .lean(),
    GroupPost.find({ content: rx })
      .select('content author group')
      .limit(5)
      .populate({ path: 'author', select: 'firstName lastName profilePic' })
      .lean(),
  ]);

  return Response.json({ users, groups, posts: [...posts1, ...posts2] });
}

