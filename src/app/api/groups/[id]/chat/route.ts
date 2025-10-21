﻿// src/app/api/groups/[id]/chat/route.ts
export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import GroupMembership from "@/models/GroupMembership";\nimport GroupMessage from "@/models/GroupMessage";
import mongoose from "mongoose";

/**
 * GET /api/groups/[id]/chat
 * ?cursor=<ISO date|string>  => bundan daha eski mesajlarÄ± getir
 * ?limit=<number>            => default 30
 *
 * En yeni -> eski sÄ±ralÄ± alÄ±r, sonra UI kolay okusun diye tersine Ã§evirip (eski -> yeni) dÃ¶ner.
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

    // Ãœyelik kontrolÃ¼
    const me = (session as any).user.id as string;
    const isMember = await GroupMembership.exists({ group: groupId, user: me });
    if (!isMember) return new Response("Forbidden", { status: 403 });

    // Pagination
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 30), 100);
    const cursor = searchParams.get("cursor"); // ISO date veya createdAt deÄŸeri

    const q: any = { group: groupId };
    if (cursor) {
      const curDate = new Date(cursor);
      if (!isNaN(curDate.getTime())) q.createdAt = { $lt: curDate };
    }

    const docs = await GroupMessage.find(q)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "firstName lastName profilePic")
      .lean();

    // UI iÃ§in eskiâ†’yeni sÄ±ralayalÄ±m
    const messages = docs.reverse();

    // Sonraki sayfa iÃ§in nextCursor = en eski kaydÄ±n createdAt'i
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

    // Ãœyelik kontrolÃ¼
    const me = (session as any).user.id as string;
    const isMember = await GroupMembership.exists({ group: groupId, user: me });
    if (!isMember) return new Response("Forbidden", { status: 403 });

    // MesajÄ± yaz
    const msg = await GroupMessage.create({
      group: groupId,
      sender: me,
      content: text,
      // seenBy: [me], // istersen gÃ¶nderene otomatik seen say
    });

    // Ä°stersen Group.lastMessageAt gÃ¼ncelle
    

    // Basit payload
    const payload = await GroupMessage.findById(msg._id)
      .populate("sender", "firstName lastName profilePic")
      .lean();

    // Not: SSE/WebSocket yayÄ±nÄ± ayrÄ± bir route veya server ile yapÄ±labilir (Ã¶rn: /api/groups/[id]/chat/stream)

    return Response.json({ ok: true, message: payload });
  } catch (err) {
    console.error("POST /groups/[id]/chat error:", err);
    return new Response("Server error", { status: 500 });
  }
}



