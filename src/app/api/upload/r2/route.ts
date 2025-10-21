export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { putBufferToR2 } from "@/lib/upload";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return new Response("file missing", { status: 400 });

    const buf = Buffer.from(await file.arrayBuffer());
    const { url } = await putBufferToR2(buf, file.type);
    return Response.json({ ok: true, url });
  } catch (e) {
    console.error("R2 buffer upload error:", e);
    return new Response("Invalid form data", { status: 400 });
  }
}
