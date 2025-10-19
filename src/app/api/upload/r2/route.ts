export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { putBufferToR2 } from "@/lib/upload";
// No 'formidable' import needed

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  try {
    // 1. Use the built-in formData parser
    const formData = await req.formData();

    // 2. Get the file from the form data by its field name
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response("file missing", { status: 400 });
    }

    // 3. Convert the Web API 'File' into a Node.js 'Buffer'
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 4. Pass the buffer and mimetype to your upload function
    const { url } = await putBufferToR2(fileBuffer, file.type);
    
    return Response.json({ ok: true, url });

  } catch (error) {
    // This will catch errors if the form data is malformed
    console.error("Error parsing form data:", error);
    return new Response("Invalid form data", { status: 400 });
  }
}