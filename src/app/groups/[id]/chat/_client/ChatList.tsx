"use client";

import { useEffect, useRef, useState } from "react";

type Message = { _id: string; content: string; createdAt?: string; sender?: { firstName?: string; lastName?: string; profilePic?: string } };

export default function ChatList({ groupId }: { groupId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const timer = useRef<NodeJS.Timeout | null>(null);

  async function load() {
    try {
      const res = await fetch(`/api/groups/${groupId}/chat`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
    } catch {}
  }

  useEffect(() => {
    load();
    timer.current = setInterval(load, 3000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [groupId]);

  return (
    <div className="section-card p-4 space-y-3">
      {messages.map((m) => (
        <div key={m._id} className="flex gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="h-6 w-6 rounded-full" src={m.sender?.profilePic || "/images/avatar-fallback.svg"} alt="" />
          <div>
            <b className="text-sm">{`${m.sender?.firstName || ""} ${m.sender?.lastName || ""}`.trim() || "User"}</b>
            <p>{m.content}</p>\n            <div className="text-[11px] text-neutral-500">\n              {m.createdAt ? new Date(m.createdAt).toLocaleString() : ""}\n            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
