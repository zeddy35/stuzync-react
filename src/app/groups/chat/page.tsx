"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  _id: string;
  sender: { name: string; _id?: string };
  content: string;
  createdAt: string;
};

export default function GroupChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Msg[]>([
    { _id: "m1", sender: { name: "Admin" }, content: "Welcome to chat!", createdAt: new Date().toISOString() },
  ]);
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    // TODO: POST /api/groups/:id/chat
    setMessages(m => [...m, { _id: String(Math.random()), sender: { name: "You" }, content: text, createdAt: new Date().toISOString() }]);
    setText("");
  }

  return (
    <div className="section-card p-0 overflow-hidden">
      <div ref={scroller} className="h-[60vh] overflow-y-auto p-4 space-y-2 bg-white/60 dark:bg-white/5">
        {messages.map(m => (
          <div key={m._id}>
            <div className="text-[11px] opacity-70 mb-1">
              {m.sender.name} · {new Date(m.createdAt).toLocaleTimeString()}
            </div>
            <div className="inline-block max-w-[80%] px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="p-3 border-t border-white/10 flex gap-2">
        <input className="input flex-1" value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message…" />
        <button className="btn btn-primary">Send</button>
      </form>
    </div>
  );
}
