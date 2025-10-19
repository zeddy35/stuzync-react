// src/app/api/ping/route.ts
export async function GET() {
  const haveMongo = !!process.env.MONGODB_URI;
  const haveAuthUrl = !!process.env.NEXTAUTH_URL;
  const haveSecret = !!process.env.NEXTAUTH_SECRET;
  return Response.json({ haveMongo, haveAuthUrl, haveSecret });
}
