// src/app/api/groups/[id]/chat/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import GroupMembership from "@/models/GroupMembership";
import GroupMessage from "@/models/GroupMessage";
import mongoose from "mongoose";
import { parseLimit, ensureMember } from "./utils";

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
      return NextResponse.json({ ok: false, mesaj: "Yetkisiz erişim" }, { status: 401 });
    }

    const groupId = params.id;
    if (!mongoose.isValidObjectId(groupId)) {
      return NextResponse.json({ ok: false, mesaj: "Geçersiz grup kimliği" }, { status: 400 });
    }

    await dbConnect();

    // Üyelik kontrolü
    const me = (session as any).user.id as string;
    const isMember = await ensureMember(me, groupId, (f) => GroupMembership.exists(f).then(Boolean) as any);
    if (!isMember) return NextResponse.json({ ok: false, mesaj: "Bu gruba erişim yetkiniz yok" }, { status: 403 });

    // Pagination
    const { searchParams } = new URL(req.url);
    const limit = parseLimit(searchParams);
    const cursor = searchParams.get("cursor"); // ISO date veya createdAt değeri

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

    // UI için eski→yeni sıralayalım
    const messages = docs.reverse();

    // Sonraki sayfa için nextCursor = en eski kaydın createdAt'i
    const nextCursor = docs.length === limit ? docs[docs.length - 1].createdAt?.toISOString?.() : null;

    return NextResponse.json({ ok: true, messages, nextCursor });
  } catch (err) {
    console.error("GET /groups/[id]/chat error:", err);
    return NextResponse.json({ ok: false, mesaj: "Sunucu hatası" }, { status: 500 });
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
      return NextResponse.json({ ok: false, mesaj: "Yetkisiz erişim" }, { status: 401 });
    }

    const groupId = params.id;
    if (!mongoose.isValidObjectId(groupId)) {
      return NextResponse.json({ ok: false, mesaj: "Geçersiz grup kimliği" }, { status: 400 });
    }

    await dbConnect();

    const body = await req.json().catch(() => ({}));
    const raw = String(body.text ?? "").trim();
    const text = raw.replace(/\s+/g, " "); // basit normalize

    if (!text) return NextResponse.json({ ok: false, mesaj: "Mesaj metni gerekli" }, { status: 400 });
    if (text.length > 4000) return NextResponse.json({ ok: false, mesaj: "Mesaj çok uzun (max 4000)" }, { status: 413 });

    // Üyelik kontrolü
    const me = (session as any).user.id as string;
    const isMember = await ensureMember(me, groupId, (f) => GroupMembership.exists(f).then(Boolean) as any);
    if (!isMember) return NextResponse.json({ ok: false, mesaj: "Bu gruba erişim yetkiniz yok" }, { status: 403 });

    // Mesajı yaz
    const msg = await GroupMessage.create({
      group: groupId,
      sender: me,
      content: text,
    });

    // Basit payload
    const payload = await GroupMessage.findById(msg._id)
      .populate("sender", "firstName lastName profilePic")
      .lean();

    return NextResponse.json({ ok: true, message: payload });
  } catch (err) {
    console.error("POST /groups/[id]/chat error:", err);
    return NextResponse.json({ ok: false, mesaj: "Sunucu hatası" }, { status: 500 });
  }
}

