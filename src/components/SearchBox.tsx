"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Result = {
  users: Array<{ _id: string; firstName?: string; lastName?: string; profilePic?: string }>;
  groups: Array<{ _id: string; name: string; description?: string; avatar?: string }>;
  posts: Array<{ _id: string; content?: string; author?: { firstName?: string; lastName?: string } }>;
};

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) { setRes(null); return; }
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, { cache: 'no-store' });
        if (!r.ok) return; const data = await r.json(); setRes(data); setOpen(true);
      } catch {}
    }, 250);
  }, [q]);

  return (
    <div className="relative" ref={wrapRef}>
      <form className="section-card p-2" action="/explore" method="GET" onSubmit={()=>setOpen(false)}>
        <input
          type="text"
          name="q"
          placeholder="Search posts, people, groups"
          className="w-full rounded-md bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm outline-none"
          autoComplete="off"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          onFocus={()=>{ if ((res?.users?.length||0)+(res?.groups?.length||0)+(res?.posts?.length||0)>0) setOpen(true); }}
        />
      </form>
      {open && res && (
        <div className="absolute left-0 right-0 mt-2 z-50 rounded-lg border border-white/20 bg-white dark:bg-[#0b1020] shadow-xl">
          <div className="p-2 text-xs text-neutral-500">Quick results</div>
          <div className="max-h-80 overflow-auto">
            {(res.users||[]).slice(0,3).map(u => (
              <Link key={`u-${u._id}`} href={`/profile/${u._id}`} className="block px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <span className="font-medium">{`${u.firstName||''} ${u.lastName||''}`.trim()}</span>
              </Link>
            ))}
            {(res.groups||[]).slice(0,3).map(g => (
              <Link key={`g-${g._id}`} href={`/groups/${g._id}`} className="block px-3 py-2 hover:bg-black/5 dark:hover:bg_white/10 text-sm">
                <span className="font-medium">{g.name}</span>
                {g.description && <span className="ml-1 text-neutral-500">– {g.description}</span>}
              </Link>
            ))}
            {(res.posts||[]).slice(0,4).map((p,i) => (
              <div key={`p-${p._id}-${i}`} className="px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300">
                {p.author && <span className="font-medium">{p.author.firstName} {p.author.lastName}</span>}{' '}
                <span className="whitespace-pre-wrap">{(p.content||'').slice(0,80)}{(p.content||'').length>80?'…':''}</span>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-white/10 text-right text-sm">
            <Link href={`/explore?q=${encodeURIComponent(q)}`} className="text-emerald-600 hover:underline" onClick={()=>setOpen(false)}>
              Show more
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

