export const runtime = "nodejs";
import { parseMultipart, putFile } from "@/lib/upload";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const { files } = await parseMultipart(req);
  const f = files.file?.[0];
  if (!f) return new Response("No file", { status: 400 });

  const { url } = await putFile(f); // ✅ local veya R2
  await User.findByIdAndUpdate((session as any).user.id, { profileBanner: url });
  return Response.json({ ok: true, url });
}
