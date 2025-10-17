export const runtime = "nodejs";
import { parseMultipart, putFile } from "@/lib/upload";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import fs from "node:fs";
import path from "node:path";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  await dbConnect();
  const { files } = await parseMultipart(req);
  const f = files.file?.[0];
  if (!f) return new Response("No file", { status: 400 });

  // Eski resmi sil (sadece local path ise)
  const me = await User.findById((session as any).user.id).select("profilePic");
  if (me?.profilePic?.startsWith("/uploads/")) {
    const oldAbs = path.join(process.cwd(), "public", me.profilePic.slice(1));
    fs.existsSync(oldAbs) && fs.unlinkSync(oldAbs);
  }

  const { url } = await putFile(f); // ✅ local veya R2
  await User.findByIdAndUpdate((session as any).user.id, { profilePic: url });
  return Response.json({ ok: true, url });
}
