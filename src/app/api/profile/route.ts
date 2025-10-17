import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const USERNAME_RX = /^[a-z0-9._-]{3,24}$/;
const RESERVED = new Set(["login","logout","register","settings","profile","feed","admin","api","onboarding","u","posts","connect"]);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const { name, headline, school, bio, username, linkedin, github, instagram, website } = await req.json();
  if (!name?.trim()) return new Response("Name required", { status: 400 });
  if (bio && bio.length > 500) return new Response("Bio too long", { status: 400 });

  let uname = (username || "").toLowerCase().trim();
  if (uname) {
    if (!USERNAME_RX.test(uname) || RESERVED.has(uname)) return new Response("Bad username", { status: 400 });
    const exists = await User.findOne({ username: uname, _id: { $ne: (session as any).user.id } }).lean();
    if (exists) return new Response("Username taken", { status: 409 });
  } else uname = undefined as any;

  await User.findByIdAndUpdate((session as any).user.id, {
    ...(uname ? { username: uname } : {}),
    name: name.trim(),
    headline: (headline || "").trim(),
    school: (school || "").trim(),
    bio: (bio || "").trim(),
    social: {
      linkedin: (linkedin || "").trim(),
      github: (github || "").trim(),
      instagram: (instagram || "").trim(),
      website: (website || "").trim(),
    },
  });

  return Response.json({ ok: true });
}
