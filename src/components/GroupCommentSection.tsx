"use client";

import { useEffect, useState, useTransition } from "react";

type Comment = { _id: string; text: string; author?: { firstName?: string; lastName?: string; profilePic?: string }; likes?: string[] };

export default function GroupCommentSection({ groupId, postId }: { groupId: string; postId: string }) {
  const [list, setList] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let on = true;
    (async () => {
      try {
        const r = await fetch(`/api/groups/${groupId}/posts/${postId}/comments`, { cache: 'no-store' });
        if (!r.ok) return; const data = await r.json(); if (on) setList(data.comments||[]);
      } catch {}
    })();
    return () => { on = false; };
  }, [groupId, postId]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim(); if (!value) return;
    startTransition(async () => {
      const optimistic: Comment = { _id: `tmp-${Date.now()}`, text: value };
      setList((l)=> (l||[]).concat(optimistic)); setText("");
      const r = await fetch(`/api/groups/${groupId}/posts/${postId}/comments`, { method:'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ text: value }) });
      if (!r.ok) { setList((l)=> (l||[]).filter(c=>c._id !== optimistic._id)); }
      else { const d = await r.json(); setList((l)=> (l||[]).map(c=> c._id===optimistic._id ? { ...c, _id: String(d.commentId) } : c)); }
    });
  }

  return (
    <div>
      {list === null ? (
        <div className="text-xs text-neutral-500">Loading comments…</div>
      ) : list.length === 0 ? (
        <div className="text-xs text-neutral-500">No comments yet.</div>
      ) : (
        <ul className="space-y-2">
          {list.map((c) => (
            <li key={c._id} className="text-sm flex items-start gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.author?.profilePic || "/images/avatar-fallback.svg"} alt="" className="h-6 w-6 rounded-full object-cover" width="24" height="24" />
              <div>
                <div className="font-medium inline">{`${c.author?.firstName ?? ''} ${c.author?.lastName ?? ''}`.trim() || 'You'}</div>{' '}
                <span className="whitespace-pre-wrap">{c.text}</span>
                <div className="mt-1 text-xs text-neutral-500 flex items-center gap-2">
                  <CommentLike groupId={groupId} postId={postId} commentId={c._id} initialLikes={c.likes?.length || 0} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={submit} className="mt-2 flex items-center gap-2">
        <input className="input flex-1" placeholder="Write a comment" value={text} onChange={(e)=>setText(e.target.value)} maxLength={500} />
        <button className="btn btn-secondary btn-sm" disabled={pending || !text.trim()}>{pending ? 'Sending…' : 'Send'}</button>
      </form>
    </div>
  );
}

function CommentLike({ groupId, postId, commentId, initialLikes }: { groupId: string; postId: string; commentId: string; initialLikes: number }) {
  const [liked, setLiked] = (require('react') as typeof import('react')).useState(false);
  const [likes, setLikes] = (require('react') as typeof import('react')).useState(initialLikes || 0);
  async function toggle() {
    const next = !liked; setLiked(next); setLikes((c)=> c + (next?1:-1));
    const method = next ? 'POST' : 'DELETE';
    const r = await fetch(`/api/groups/${groupId}/posts/${postId}/comments/${commentId}/like`, { method });
    if (!r.ok) { setLiked(!next); setLikes((c)=> c + (next?-1:1)); } else { const d = await r.json(); if (typeof d.likes === 'number') setLikes(d.likes); }
  }
  return (
    <>
      <button className="btn btn-ghost btn-xs" onClick={toggle}>{liked ? 'Unlike' : 'Like'}</button>
      <span>{likes}</span>
    </>
  );
}
