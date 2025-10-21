"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PostItem from "@/components/PostItem";
import { on, FEED_CHANNELS } from "@/lib/feedBus";

type Author = { _id?: string; firstName?: string; lastName?: string; profilePic?: string };
type Post = { _id: string; author?: Author; content?: string; likes?: string[] };

export default function FeedList({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialPosts.length ? String((initialPosts[initialPosts.length-1] as any)._id) : null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const key = useMemo(() => JSON.stringify(initialPosts.map(p => p._id)), [initialPosts]);

  // Reset to server data whenever it changes (e.g., router.refresh())
  useEffect(() => {
    setPosts(initialPosts);
    setCursor(initialPosts.length ? String((initialPosts[initialPosts.length-1] as any)._id) : null);
    setDone(false);
  }, [key]);

  // optimistic insertion
  useEffect(() => {
    return on(FEED_CHANNELS.PostAdded, (p: Post) => {
      setPosts((prev) => [p, ...prev]);
    });
  }, []);

  // infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || done) return;
    const io = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !loading && cursor) {
        setLoading(true);
        try {
          const r = await fetch(`/api/feed?cursor=${encodeURIComponent(cursor)}&limit=20`, { cache: "no-store" });
          if (!r.ok) throw new Error();
          const data = await r.json();
          setPosts((p) => [...p, ...(data.posts || [])]);
          setCursor(data.nextCursor || null);
          if (!data.nextCursor) setDone(true);
        } catch {
          // ignore silently
        } finally {
          setLoading(false);
        }
      }
    }, { rootMargin: "200px" });
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, [cursor, loading, done]);

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <FeedSkeleton count={6} />
      ) : (
        posts.map((p) => <PostItem key={p._id} post={p} />)
      )}
      {!done && <div ref={sentinelRef} className="h-6" />}
      {loading && <div className="text-xs text-neutral-500 px-2">Loading…</div>}
    </div>
  );
}

function FeedSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="section-card animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-neutral-200/70 dark:bg-white/10" />
            <div className="flex-1">
              <div className="h-3 w-40 rounded bg-neutral-200/70 dark:bg-white/10" />
              <div className="mt-2 h-2 w-24 rounded bg-neutral-200/70 dark:bg-white/10" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-neutral-200/70 dark:bg-white/10" />
            <div className="h-3 w-11/12 rounded bg-neutral-200/70 dark:bg-white/10" />
            <div className="h-3 w-5/6 rounded bg-neutral-200/70 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
