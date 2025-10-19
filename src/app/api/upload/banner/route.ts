// src/app/api/upload/banner/route.ts
export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { fileFromForm } from "@/lib/upload";
// import { r2DeleteObject } from "@/lib/r2"; // eski banner key silmek istersen ekleyebilirsin

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  await dbConnect();

  const form = await req.formData();
  const uploaded = await fileFromForm(form, "file", {
    prefix: "banners",
    allow: ["image/"],
    maxSizeMB: 10,
  });

  if (!uploaded) return new Response("No file", { status: 400 });

  await User.findByIdAndUpdate((session as any).user.id, {
    profileBanner: uploaded.url,
    // profileBannerKey: uploaded.key,
  });

  return Response.json({ ok: true, url: uploaded.url });
}
