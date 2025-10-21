export const runtime = "nodejs";

import { NextResponse } from "next/server"; // Türkçe: JSON yanıtlarda NextResponse kullanıyoruz.
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { fileFromForm } from "@/lib/upload";

// Türkçe: Avatar yükleme ucu (FormData "file").
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false, mesaj: "Yetkisiz erişim" }, { status: 401 });

  await dbConnect();

  try {
    const form = await req.formData();
    const uploaded = await fileFromForm(form, "file", { prefix: "avatars", allow: ["image/"] });
    if (!uploaded) return NextResponse.json({ ok: false, mesaj: "Dosya bulunamadı" }, { status: 400 });

    await User.findByIdAndUpdate((session as any).user.id, { profilePic: uploaded.url });

    return NextResponse.json({ ok: true, url: uploaded.url });
  } catch (e: any) {
    const msg = String(e?.message || e || "Yükleme başarısız");
    if (msg.includes("R2 env")) return NextResponse.json({ ok: false, mesaj: "R2 yapılandırılmamış" }, { status: 400 });
    return NextResponse.json({ ok: false, mesaj: msg }, { status: 500 });
  }
}

