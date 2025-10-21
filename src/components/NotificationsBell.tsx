"use client";

import { useEffect, useRef, useState } from "react";

type Noti = {
  _id: string;
  type: "like" | "comment" | "follow" | "zync";
  isRead?: boolean;
  createdAt?: string;
  actor?: { _id?: string; firstName?: string; lastName?: string; profilePic?: string };
  post?: string;
};

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState<number>(0);
  const [items, setItems] = useState<Noti[] | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Fetch unread count on mount
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/notifications/count", { cache: "no-store" });
        if (!r.ok) return;
        const data = await r.json();
        setUnread(Number(data.unread || 0));
      } catch {}
    })();
  }, []);

  // Close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function toggle() {
    if (!open && items == null) {
      try {
        const r = await fetch("/api/notifications", { cache: "no-store" });
        if (r.ok) {
          const data = await r.json();
          setItems(data.notifications || []);
        }
      } catch {}
    }
    setOpen((v) => !v);
    if (unread > 0) {
      // best-effort mark as read
      setUnread(0);
      try { await fetch("/api/notifications", { method: "PATCH" }); } catch {}
    }
  }

  function label(n: Noti) {
    const name = `${n.actor?.firstName ?? ""} ${n.actor?.lastName ?? ""}`.trim() || "Someone";
    if (n.type === "like") return `${name} liked your post`;
    if (n.type === "comment") return `${name} commented on your post`;
    if (n.type === "follow") return `${name} started following you`;
    return `${name} sent a zync request`;
  }

  function hrefFor(n: Noti) {
    if (n.type === "follow" || n.type === "zync") return `/profile/${n.actor?._id ?? ""}`;
    if (n.post) return `/feed#post-${n.post}`;
    return "/feed";
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button className="relative px-2 py-1 rounded hover:bg-black/5 dark:hover:bg-white/10" onClick={toggle} aria-label="Notifications">
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] leading-none bg-emerald-600 text-white rounded-full px-1.5 py-0.5">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-lg border border-white/20 bg-white dark:bg-[#0b1020] shadow-xl z-50">
          <div className="p-2 text-sm font-semibold flex items-center justify-between">
            <span>Notifications</span>
            <button
              className="btn btn-ghost btn-xs"
              onClick={async () => { try { await fetch('/api/notifications', { method:'PATCH' }); } catch {}; setUnread(0); }}
            >
              Mark all as read
            </button>
          </div>
          <div className="max-h-80 overflow-auto divide-y divide-white/10">
            {items == null && (
              <div className="p-3 text-sm text-neutral-500">Loading…</div>
            )}
            {items && items.length === 0 && (
              <div className="p-3 text-sm text-neutral-500">No notifications</div>
            )}
            {items && items.map((n) => (
              <div key={n._id} className="p-3 text-sm hover:bg-black/5 dark:hover:bg-white/10">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={n.actor?.profilePic || "/images/avatar-fallback.svg"} alt="" className="h-7 w-7 rounded-full object-cover" width="28" height="28" />
                  <div className="flex-1">
                    <a href={hrefFor(n)} className="block">
                      <div>{label(n)}</div>
                      {n.createdAt && <div className="text-xs text-neutral-500">{new Date(n.createdAt).toLocaleString()}</div>}
                    </a>
                  </div>
                </div>

                {n.type === 'zync' && (
                  <div className="mt-2 flex items-center gap-2 pl-9">
                    <button
                      className="btn btn-primary btn-xs"
                      onClick={async () => {
                        try {
                          await fetch(`/api/connect/accept/${n.actor?._id}`, { method: 'POST' });
                          setItems((list)=> (list||[]).filter((x)=> x._id !== n._id));
                        } catch {}
                      }}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={async () => {
                        try {
                          await fetch(`/api/connect/decline/${n.actor?._id}`, { method: 'POST' });
                          setItems((list)=> (list||[]).filter((x)=> x._id !== n._id));
                        } catch {}
                      }}
                    >
                      Ignore
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
