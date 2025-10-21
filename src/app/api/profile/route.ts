export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

// Türkçe: Profil güncelleme ucu (yalnızca PATCH). JSON gövde bekler.
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false, mesaj: "Yetkisiz erişim" }, { status: 401 });

  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const {
    firstName = "", lastName = "", school = "",
    bio = "", skills = [], interests = [],
    avatarUrl, bannerUrl, mustCompleteProfile,
  } = body || {};

  const update: any = { firstName, lastName, school, bio, skills, interests };
  if (typeof avatarUrl === "string") update.profilePic = avatarUrl;
  if (typeof bannerUrl === "string") update.profileBanner = bannerUrl;
  if (mustCompleteProfile === false) update.mustCompleteProfile = false;

  const user = await User.findByIdAndUpdate(
    (session as any).user.id,
    { $set: update },
    { new: true, runValidators: true }
  ).lean();

  if (!user) return NextResponse.json({ ok: false, mesaj: "Kullanıcı bulunamadı" }, { status: 404 });
  return NextResponse.json({ ok: true, user });
}
