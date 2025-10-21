// Türkçe: Chat route yardımcıları (unit test edilebilir).
export function parseLimit(searchParams: URLSearchParams, defaultLimit = 30, min = 1, max = 100) {
  const raw = Number(searchParams.get("limit"));
  if (!Number.isFinite(raw)) return defaultLimit;
  const n = Math.floor(raw);
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

export async function ensureMember(
  userId: string,
  groupId: string,
  exists: (filter: any) => Promise<any>
): Promise<boolean> {
  if (!userId || !groupId) return false;
  const found = await exists({ group: groupId, user: userId });
  return !!found;
}

