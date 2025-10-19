import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  await dbConnect();
  const body = await req.json().catch(() => ({} as any));
  const firstName = (body.firstName || "").trim();
  const lastName = (body.lastName || "").trim();
  const school = (body.school || "").trim();

  const email = String(session.user.email).toLowerCase();
  const updated = await User.findOneAndUpdate(
    { email },
    {
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      ...(school ? { school } : {}),
      mustCompleteProfile: false,
    },
    { new: true }
  ).lean();

  if (!updated) return new Response("User not found", { status: 404 });
  const response = NextResponse.json({ ok: true });
  // signal middleware to allow feed redirect before JWT refresh
  response.cookies.set("onboarding_done", "1", { path: "/", maxAge: 300, sameSite: "lax" });
  return response;
}



