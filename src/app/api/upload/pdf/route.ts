export const runtime = "nodejs";

import { NextResponse } from "next/server"; // Türkçe: JSON yanıtlarda NextResponse kullanıyoruz.
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fileFromForm } from "@/lib/upload";

// Türkçe: PDF yükleme ucu (yalnızca application/pdf).
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false, mesaj: "Yetkisiz erişim" }, { status: 401 });

  try {
    const form = await req.formData();
    const uploaded = await fileFromForm(form, "file", { prefix: "docs", allow: ["application/pdf"], maxSizeMB: 20 });
    if (!uploaded) return NextResponse.json({ ok: false, mesaj: "Dosya bulunamadı" }, { status: 400 });
    return NextResponse.json({ ok: true, url: uploaded.url });
  } catch (e: any) {
    const msg = String(e?.message || e || "Yükleme başarısız");
    if (msg.includes("R2 env")) return NextResponse.json({ ok: false, mesaj: "R2 yapılandırılmamış" }, { status: 400 });
    return NextResponse.json({ ok: false, mesaj: msg }, { status: 400 });
  }
}
