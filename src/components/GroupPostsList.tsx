"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MediaGrid from "@/components/MediaGrid";
import GroupCommentSection from "@/components/GroupCommentSection";
import GroupPostActions from "@/components/GroupPostActions";

type Author = { firstName?: string; lastName?: string; profilePic?: string };
type Post = { _id: string; author?: Author; content?: string; fileUrl?: string; files?: string[]; liked?: boolean; likesCount?: number; commentCount?: number };

export default function GroupPostsList({ groupId, initial }: { groupId: string; initial: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initial);
  const [cursor, setCursor] = useState<string | null>(initial.length ? String(initial[initial.length-1]._id) : null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const key = useMemo(()=> JSON.stringify(initial.map(p=>p._id)), [initial]);

  useEffect(()=>{ setPosts(initial); setCursor(initial.length ? String(initial[initial.length-1]._id) : null); setDone(false); }, [key]);

  useEffect(() => {
    if (!ref.current || done) return;
    const io = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !loading && cursor) {
        setLoading(true);
        try {
          const r = await fetch(`/api/groups/${groupId}/posts?cursor=${encodeURIComponent(cursor)}&limit=20`, { cache: 'no-store' });
          if (!r.ok) return;
          const data = await r.json();
          setPosts((p)=> [...p, ...(data.posts||[])]);
          setCursor(data.nextCursor || null);
          if (!data.nextCursor) setDone(true);
        } finally { setLoading(false); }
      }
    }, { rootMargin: '200px' });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [cursor, loading, done, groupId]);

  return (
    <div className="space-y-3">
      {posts.map((p) => (
        <article key={p._id} className="section-card p-4">
          <div className="text-sm text-neutral-500">by {p.author?.firstName} {p.author?.lastName}</div>
          {p.content && <p className="mt-2 whitespace-pre-wrap">{p.content}</p>}
          {Array.isArray(p.files) && p.files.length>0 ? (
            <MediaGrid files={p.files} />
          ) : (
            p.fileUrl && (/\.pdf($|\?)/i.test(String(p.fileUrl)) ? (
              <a className="text-sm text-emerald-600 underline mt-2 inline-block" href={String(p.fileUrl)} target="_blank">View PDF</a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={String(p.fileUrl)} alt="attachment" className="mt-2 rounded-lg max-h-80" />
            ))
          )}

          <div className="mt-3">
            {/* @ts-expect-error Client Component */}
            <GroupCommentSection groupId={groupId} postId={p._id} />
          </div>
          <div className="mt-3">
            {/* @ts-expect-error Client Component */}
            <GroupPostActions groupId={groupId} postId={p._id} initialLiked={!!p.liked} initialLikes={Number(p.likesCount||0)} initialComments={Number(p.commentCount||0)} />
          </div>
        </article>
      ))}
      {!done && <div ref={ref} className="h-6" />}
      {loading && <div className="text-xs text-neutral-500">Loading…</div>}
    </div>
  );
}

