// src/app/api/upload/avatar/route.ts
export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { fileFromForm } from "@/lib/upload";
// import { r2DeleteObject } from "@/lib/r2"; // eski key'i silmek istersen

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  await dbConnect();

  const form = await req.formData();
  const uploaded = await fileFromForm(form, "file", { prefix: "avatars", allow: ["image/"] });
  if (!uploaded) return new Response("No file", { status: 400 });

  // eski key tutuyorsan:
  // const me = await User.findById((session as any).user.id).select("profilePicKey");
  // if (me?.profilePicKey) try { await r2DeleteObject(me.profilePicKey); } catch {}

  await User.findByIdAndUpdate((session as any).user.id, {
    profilePic: uploaded.url,
    // profilePicKey: uploaded.key, // istersen modele ekle
  });

  return Response.json({ ok: true, url: uploaded.url });
}
