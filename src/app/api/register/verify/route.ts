import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return new Response("Bad token", { status: 400 });

  const u = await User.findOne({ verifyToken: token });
  if (!u) return new Response("Invalid token", { status: 400 });

  u.isVerified = true;
  u.verifyToken = undefined;
  await u.save();

  // İstersen redirect:
/*  return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?verified=1`); */
  return Response.json({ ok: true });
}
