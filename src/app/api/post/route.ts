export const runtime = "nodejs";
import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";
import { parseMultipart, putFile } from "@/lib/upload";
import { checkImage } from "@/lib/moderation";
import path from "node:path";
import fs from "node:fs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url);
  const tag = url.searchParams.get("tag");
  const q: any = { isFlagged: false };
  if (tag) q.tags = tag;
  const posts = await Post.find(q)
    .populate("author", "name profilePic")
    .populate({ path: "sharedFrom", populate: { path: "author", select: "name profilePic" } })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  return Response.json({ posts });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const { fields, files } = await parseMultipart(req);
  const content = String(fields.content || "").trim();
  const tags = String(fields.tags || "")
    .split(",").map(t=>t.trim().toLowerCase()).filter(Boolean);

  if (!content && !files.file?.length) return new Response("Empty post", { status: 400 });

  let fileUrl: string | null = null;
  let flagged = false;

  if (files.file?.length) {
    const f = files.file[0];
    // önce R2/local’a yükle:
    const { url } = await putFile(f);
    fileUrl = url;

    // moderasyon: sadece görseller
    const mime = f.mimetype || "";
    if (mime.startsWith("image/")) {
      // local’deyse dosyaya erişebilelim diye küçük kontrol
      if (url.startsWith("/uploads/")) {
        const abs = path.join(process.cwd(), "public", url.slice(1));
        if (fs.existsSync(abs)) {
          const safe = await checkImage(abs);
          if (!safe) flagged = true;
        } else {
          flagged = true;
        }
      } else {
        // R2 URL'i ise (dosyayı indirmeden) moderasyonu atlayabilir veya Rekognition’a objeyi işaret edebilirsin
      }
    }
  }

  await Post.create({
    author: (session as any).user.id,
    content,
    fileUrl,
    isFlagged: flagged,
    tags,
  });

  return Response.json({ ok: true, flagged });
}
