export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";

async function readForm(req: NextRequest) {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const b = await req.json().catch(() => ({}));
    return { name: b.name || "", email: b.email || "", school: b.school || "", phone: b.phone || "", password: b.password || "" };
  }
  const form = await req.formData();
  return {
    name: String(form.get("name") || ""),
    email: String(form.get("email") || ""),
    school: String(form.get("school") || ""),
    phone: String(form.get("phone") || ""),
    password: String(form.get("password") || ""),
  };
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, email, school, phone, password } = await readForm(req);
    if (!name || !email || !password) return NextResponse.json({ ok: false, mesaj: "Ad, e-posta ve şifre zorunludur" }, { status: 400 });

    const exists = await User.findOne({ email: email.toLowerCase().trim() }).select("_id").lean();
    if (exists) return NextResponse.json({ ok: false, mesaj: "Bu e-posta zaten kayıtlı" }, { status: 409 });

    const [firstName, ...rest] = name.trim().split(/\s+/);
    const lastName = rest.join(" ");
    const hashed = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(24).toString("hex");

    await User.create({
      firstName: firstName || "",
      lastName,
      email: email.toLowerCase().trim(),
      phone: phone || undefined,
      password: hashed,
      school: school || undefined,
      isVerified: false,
      verifyToken,
      roles: ["user"],
      mustCompleteProfile: true,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const link = `${appUrl}/api/register/verify?token=${verifyToken}`;
    await sendVerificationEmail(email, link);

    return NextResponse.json({ ok: true, mesaj: "Kayıt oluşturuldu. Lütfen e-postanızı doğrulayın." });
  } catch (e) {
    console.error("REGISTER_ERROR", e);
    return NextResponse.json({ ok: false, mesaj: "Sunucu hatası" }, { status: 500 });
  }
}
