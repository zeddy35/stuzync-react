import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Group from "@/models/Group";
import GroupMembership from "@/models/GroupMembership";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  const membership = await GroupMembership.findOne({ group: params.id, user: (session as any).user.id }).select("role").lean();
  if (!membership) return new Response("Forbidden", { status: 403 });
  if (!['owner','admin','moderator'].includes((membership as any).role)) return new Response("Forbidden", { status: 403 });

  const body = await req.json().catch(()=>({}));
  const name = typeof body.name === 'string' ? body.name.trim() : undefined;
  const description = typeof body.description === 'string' ? body.description.trim() : undefined;
  const visibility = body.visibility === 'private' ? 'private' : body.visibility === 'public' ? 'public' : undefined;
  const $set: any = {};
  if (name) $set.name = name;
  if (description !== undefined) $set.description = description;
  if (visibility) $set.visibility = visibility;
  if (Object.keys($set).length === 0) return Response.json({ ok: true });
  await Group.updateOne({ _id: params.id }, { $set });
  return Response.json({ ok: true });
}

