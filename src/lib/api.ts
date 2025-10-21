import { cookies, headers } from 'next/headers';

const API = process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:3000';

export async function apiGet(path: string, init: RequestInit = {}) {
  const cookie = cookies().toString();
  return fetch(`${API}${path}`, {
    ...init,
    headers: { ...(init.headers||{}), cookie },
    cache: 'no-store',
  });
}

export async function apiPost(path: string, body: any, init: RequestInit = {}) {
  const cookie = cookies().toString();
  return fetch(`${API}${path}`, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(init.headers||{}),
      cookie,
    },
    cache: 'no-store',
  });
}

export async function serverJson<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

