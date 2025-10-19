// src/app/api/groups/[id]/members/invite/route.ts
export const runtime = "nodejs";

import mongoose, { Types } from "mongoose";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import GroupMembership from "@/models/GroupMembership";
import User from "@/models/User";

// Narrow role union so TS knows what me.role is
type MemberRole = "admin" | "moderator" | "member";

// Minimal lean shapes we read from Mongo
type GroupMembershipLean = { _id: Types.ObjectId; role: MemberRole };
type LeanUserIdOnly = { _id: Types.ObjectId };

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

  // only admin/moderator can invite
  const me = await GroupMembership.findOne({
    group: id,
    user: (session as any).user.id,
  })
    .select("role")
    .lean<GroupMembershipLean | null>(); // ✅ tell TS exactly what comes back

  if (!me || (me.role !== "admin" && me.role !== "moderator")) {
    return new Response("Forbidden", { status: 403 });
  }

  const body = await req.json().catch(() => ({} as { email?: string }));
  const { email } = body;
  if (!email) return new Response("Email required", { status: 400 });

  const user = await User.findOne({ email }).select("_id").lean<LeanUserIdOnly | null>(); // ✅ typed
  if (!user) return new Response("User not found", { status: 404 });

  await GroupMembership.updateOne(
    { group: id, user: user._id },
    { $setOnInsert: { role: "member" as MemberRole } },
    { upsert: true }
  );

  return Response.json({ ok: true });
}
