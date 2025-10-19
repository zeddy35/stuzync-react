// src/app/api/groups/[id]/chat/route.ts
export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Group from "@/models/Group";
import Message from "@/models/Conversation";
import mongoose from "mongoose";

/**
 * GET /api/groups/[id]/chat
 * ?cursor=<ISO date|string>  => bundan daha eski mesajları getir
 * ?limit=<number>            => default 30
 *
 * En yeni -> eski sıralı alır, sonra UI kolay okusun diye tersine çevirip (eski -> yeni) döner.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const groupId = params.id;
    if (!mongoose.isValidObjectId(groupId)) {
      return new Response("Invalid group id", { status: 400 });
    }

    await dbConnect();

    // Üyelik kontrolü
    const group = await Group.findById(groupId).select("_id members");
    if (!group) return new Response("Group not found", { status: 404 });

    const me = (session as any).user.id as string;
    const isMember = group.members.some((m: mongoose.Types.ObjectId) => String(m) === me);
    if (!isMember) return new Response("Forbidden", { status: 403 });

    // Pagination
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 30), 100);
    const cursor = searchParams.get("cursor"); // ISO date veya createdAt değeri

    const q: any = { group: group._id };
    if (cursor) {
      const curDate = new Date(cursor);
      if (!isNaN(curDate.getTime())) q.createdAt = { $lt: curDate };
    }

    const docs = await Message.find(q)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "firstName lastName profilePic")
      .lean();

    // UI için eski→yeni sıralayalım
    const messages = docs.reverse();

    // Sonraki sayfa için nextCursor = en eski kaydın createdAt'i
    const nextCursor =
      docs.length === limit ? docs[docs.length - 1].createdAt?.toISOString?.() : null;

    return Response.json({ ok: true, messages, nextCursor });
  } catch (err) {
    console.error("GET /groups/[id]/chat error:", err);
    return new Response("Server error", { status: 500 });
  }
}

/**
 * POST /api/groups/[id]/chat
 * Body: { text: string }
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const groupId = params.id;
    if (!mongoose.isValidObjectId(groupId)) {
      return new Response("Invalid group id", { status: 400 });
    }

    await dbConnect();

    const body = await req.json().catch(() => ({}));
    const raw = String(body.text ?? "").trim();
    const text = raw.replace(/\s+/g, " "); // basit normalize

    if (!text) return new Response("Message text required", { status: 400 });
    if (text.length > 4000) return new Response("Message too long", { status: 413 });

    // Üyelik kontrolü
    const group = await Group.findById(groupId).select("_id members");
    if (!group) return new Response("Group not found", { status: 404 });

    const me = (session as any).user.id as string;
    const isMember = group.members.some((m: mongoose.Types.ObjectId) => String(m) === me);
    if (!isMember) return new Response("Forbidden", { status: 403 });

    // Mesajı yaz
    const msg = await Message.create({
      group: group._id,
      sender: me,
      text,
      // seenBy: [me], // istersen gönderene otomatik seen say
    });

    // İstersen Group.lastMessageAt güncelle
    await Group.findByIdAndUpdate(group._id, { $set: { lastMessageAt: new Date() } }).catch(() => {});

    // Basit payload
    const payload = await Message.findById(msg._id)
      .populate("sender", "firstName lastName profilePic")
      .lean();

    // Not: SSE/WebSocket yayını ayrı bir route veya server ile yapılabilir (örn: /api/groups/[id]/chat/stream)

    return Response.json({ ok: true, message: payload });
  } catch (err) {
    console.error("POST /groups/[id]/chat error:", err);
    return new Response("Server error", { status: 500 });
  }
}
