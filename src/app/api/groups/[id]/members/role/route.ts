// src/app/api/groups/[id]/members/role/route.ts
export const runtime = "nodejs";

import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import GroupMembership from "@/models/GroupMembership";

// Roller için dar bir union tipi
type MemberRole = "admin" | "moderator" | "member";

// Lean dönen minimal tip
type GroupMembershipLean = {
  _id: mongoose.Types.ObjectId;
  role: MemberRole;
};

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { id } = params;
  if (!mongoose.isValidObjectId(id)) {
    return new Response("Invalid id", { status: 400 });
  }

  // sadece admin rol atayabilir
  const me = await GroupMembership.findOne({
    group: id,
    user: (session as any).user.id,
  })
    .select("role")
    .lean<GroupMembershipLean | null>(); // ✅ Lean tipi ver

  if (!me || me.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const { userId, role } = await req.json().catch(() => ({} as { userId?: string; role?: MemberRole }));
  if (!userId || !["admin", "moderator", "member"].includes(role as MemberRole)) {
    return new Response("userId & valid role required", { status: 400 });
  }
  if (!mongoose.isValidObjectId(userId)) {
    return new Response("Invalid userId", { status: 400 });
  }

  await GroupMembership.updateOne(
    { group: id, user: userId },
    { $set: { role } },
    { upsert: false }
  );

  return Response.json({ ok: true });
}
