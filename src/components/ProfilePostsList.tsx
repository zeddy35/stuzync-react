"use client";

import { useEffect, useRef, useState } from "react";

type Post = { _id: string; content?: string; createdAt: string };

export default function ProfilePostsList({ userId, initial }: { userId: string; initial: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initial);
  const [cursor, setCursor] = useState<string | null>(initial.length ? String((initial[initial.length - 1] as any)._id) : null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current || done) return;
    const io = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !loading && cursor) {
        setLoading(true);
        try {
          const r = await fetch(`/api/users/${userId}/posts?cursor=${encodeURIComponent(cursor)}&limit=10`, { cache: "no-store" });
          if (!r.ok) throw new Error();
          const data = await r.json();
          setPosts((p) => [...p, ...(data.posts || [])]);
          setCursor(data.nextCursor || null);
          if (!data.nextCursor) setDone(true);
        } finally {
          setLoading(false);
        }
      }
    }, { rootMargin: "200px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [cursor, loading, done, userId]);

  return (
    <div className="section-card space-y-3">
      {posts.length === 0 ? (
        <p className="muted">No posts yet.</p>
      ) : (
        posts.map((p) => (
          <div key={p._id} className="border-b border-white/10 last:border-0 pb-3 last:pb-0">
            {p.content ? <p className="whitespace-pre-wrap text-sm">{p.content}</p> : <p className="muted text-sm">(no text)</p>}
            <div className="text-xs text-neutral-500 mt-1">{new Date(p.createdAt).toLocaleString()}</div>
          </div>
        ))
      )}
      {!done && <div ref={ref} className="h-6" />}
      {loading && <div className="text-xs text-neutral-500">Loading…</div>}
    </div>
  );
}

