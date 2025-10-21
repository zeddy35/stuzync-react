import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ ok: false, mesaj: "Doğrulama anahtarı eksik" }, { status: 400 });

  const user = await User.findOne({ verifyToken: token }).select("_id").lean();
  if (!user) return NextResponse.json({ ok: false, mesaj: "Geçersiz doğrulama anahtarı" }, { status: 400 });

  await User.updateOne({ _id: user._id }, { $set: { isVerified: true }, $unset: { verifyToken: 1 } });

  const url = new URL("/login?verified=1", req.url);
  return NextResponse.redirect(url);
}
