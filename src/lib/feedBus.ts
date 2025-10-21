type Listener = (payload: any) => void;

const channels: Record<string, Set<Listener>> = {};

export function on(channel: string, fn: Listener) {
  if (!channels[channel]) channels[channel] = new Set();
  channels[channel].add(fn);
  return () => channels[channel].delete(fn);
}

export function emit(channel: string, payload: any) {
  (channels[channel] || []).forEach((fn) => fn(payload));
}

export const FEED_CHANNELS = {
  PostAdded: "feed:post-added",
} as const;

