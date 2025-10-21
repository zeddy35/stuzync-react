import { cookies } from "next/headers";

export async function serverJson<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const cookie = (await cookies()).toString();
  const res = await fetch(url, { ...init, headers: { ...(init.headers || {}), cookie } as any, cache: "no-store" });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return (await res.json()) as T;
}

