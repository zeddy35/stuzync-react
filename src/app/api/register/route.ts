export const runtime = "nodejs";

import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
// import { sendVerifyEmail } from "@/lib/email"; // hazır olduğunda açarsın

function splitName(full: string) {
  const n = (full || "").trim().replace(/\s+/g, " ");
  if (!n) return { firstName: "", lastName: "" };
  const parts = n.split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  return { firstName, lastName };
}

async function readRegisterInput(req: NextRequest) {
  const ct = req.headers.get("content-type") || "";
  // JSON
  if (ct.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    return {
      name: body.name ?? "",
      email: body.email ?? "",
      school: body.school ?? "",
      phone: body.phone ?? "",
      password: body.password ?? "",
      kvkk: !!body.kvkk,
    };
  }
  // Form (x-www-form-urlencoded / multipart)
  const form = await req.formData();
  return {
    name: String(form.get("name") || ""),
    email: String(form.get("email") || ""),
    school: String(form.get("school") || ""),
    phone: String(form.get("phone") || ""),
    password: String(form.get("password") || ""),
    kvkk: String(form.get("kvkk") || "") === "on" || String(form.get("kvkk") || "") === "true",
  };
}

export async function GET() {
  // Bu endpoint sadece POST kabul ediyor
  return new Response("Method Not Allowed", { status: 405 });
}

export async function POST(req: NextRequest) {
  try {
    // ENV kontrolü (hata sebebi olmasın)
    if (!process.env.MONGODB_URI) {
      return new Response("MONGODB_URI missing", { status: 500 });
    }

    await dbConnect();

    const { name, email, school, phone, password, kvkk } = await readRegisterInput(req);

    // Basit doğrulamalar
    if (!name || !email) {
      return new Response("name & email required", { status: 400 });
    }
    if (!kvkk) {
      return new Response("KVKK consent required", { status: 400 });
    }

    // Email tekil mi?
    const exists = await User.findOne({ email: email.toLowerCase().trim() }).select("_id").lean();
    if (exists) {
      return new Response("Email already registered", { status: 409 });
    }

    const { firstName, lastName } = splitName(name);

    // Parola opsiyonel (OAuth kullanıcıları için); varsa hash’le
    let hashed: string | undefined = undefined;
    if (password) {
      if (password.length < 8) {
        return new Response("Password must be at least 8 characters", { status: 400 });
      }
      hashed = await bcrypt.hash(password, 10);
    }

    // Verify token (email doğrulama akışı istersen)
    // const verifyToken = crypto.randomBytes(24).toString("hex");

    const doc = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      phone: phone || undefined,
      password: hashed,
      school: school || undefined,
      isVerified: false,
      mustCompleteProfile: true,
      roles: ["user"],
      // verifyToken,
    });

    // E-posta doğrulama (hazır olduğunda aç)
    // await sendVerifyEmail(doc.email, verifyToken);

    return Response.json({ ok: true, userId: String(doc._id) }, { status: 201 });
  } catch (err: any) {
    // Unique index hataları için güzel mesaj
    if (err?.code === 11000) {
      return new Response("Duplicate key", { status: 409 });
    }
    console.error("REGISTER_ERROR:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
