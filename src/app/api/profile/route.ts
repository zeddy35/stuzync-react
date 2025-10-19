import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function readInput(req: Request) {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const b = await req.json().catch(() => ({} as any));
    return {
      firstName: (b.firstName || "").trim(),
      lastName: (b.lastName || "").trim(),
      school: (b.school || "").trim(),
      phone: (b.phone || "").trim(),
    };
  }
  const form = await req.formData();
  return {
    firstName: String(form.get("firstName") || "").trim(),
    lastName: String(form.get("lastName") || "").trim(),
    school: String(form.get("school") || "").trim(),
    phone: String(form.get("phone") || "").trim(),
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();
  const user = await User.findById((session as any).user.id)
    .select("firstName lastName school phone email profilePic profileBanner mustCompleteProfile")
    .lean();
  if (!user) return new Response("Not found", { status: 404 });
  return Response.json({ ok: true, user });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  await dbConnect();

  const { firstName, lastName, school, phone } = await readInput(req);
  if (!firstName && !lastName && !school && !phone) return new Response("No changes", { status: 400 });

  await User.findByIdAndUpdate((session as any).user.id, {
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    ...(school ? { school } : {}),
    ...(phone ? { phone } : {}),
  });

  return Response.json({ ok: true });
}
