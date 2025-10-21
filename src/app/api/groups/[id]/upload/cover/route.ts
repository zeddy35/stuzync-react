import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Group from "@/models/Group";
import GroupMembership from "@/models/GroupMembership";
import { fileFromForm } from "@/lib/upload";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const membership = await GroupMembership.findOne({ group: params.id, user: (session as any).user.id }).select("role").lean();
  if (!membership) return new Response("Forbidden", { status: 403 });
  if (!['owner','admin','moderator'].includes((membership as any).role)) return new Response("Forbidden", { status: 403 });

  const form = await req.formData();
  const uploaded = await fileFromForm(form, 'file', { prefix: 'group-covers', allow: ['image/'], maxSizeMB: 10 }).catch((e)=>{ throw new Error(String(e?.message||e)); });
  if (!uploaded) return new Response("No file", { status: 400 });
  await Group.updateOne({ _id: params.id }, { $set: { cover: uploaded.url } });
  return Response.json({ ok: true, url: uploaded.url });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  const membership = await GroupMembership.findOne({ group: params.id, user: (session as any).user.id }).select("role").lean();
  if (!membership) return new Response("Forbidden", { status: 403 });
  if (!['owner','admin','moderator'].includes((membership as any).role)) return new Response("Forbidden", { status: 403 });
  await Group.updateOne({ _id: params.id }, { $unset: { cover: 1 } });
  return Response.json({ ok: true });
}
