// Lightweight Upstash Redis REST client (optional)
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to enable.

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

async function call(command: string[], ttlSeconds?: number) {
  if (!url || !token) return null as any;
  const body: any = {
    // Upstash pipeline style payload
    // but we can send a single command too
    // Reference: https://upstash.com/docs/redis
    // We prefer REST pipeline endpoint /pipeline for multiple
  };
  // For simplicity, we use /set and /get convenience endpoints
  // when available; otherwise fallback to /pipeline
}

export async function redisGet<T = any>(key: string): Promise<T | null> {
  if (!url || !token) return null;
  try {
    const r = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!r.ok) return null;
    const data = await r.json();
    if (data?.result == null) return null;
    try { return JSON.parse(String(data.result)) as T; } catch { return data.result as T; }
  } catch { return null; }
}

export async function redisSet(key: string, value: Json, ttlSeconds?: number) {
  if (!url || !token) return false;
  try {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    const setUrl = ttlSeconds ? `${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(payload)}?EX=${ttlSeconds}` : `${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(payload)}`;
    const r = await fetch(setUrl, { headers: { Authorization: `Bearer ${token}` }, method: 'POST' });
    return r.ok;
  } catch { return false; }
}

