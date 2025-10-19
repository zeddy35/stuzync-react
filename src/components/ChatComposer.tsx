"use client";
import { useState } from "react";

export default function ChatComposer({ groupId }: { groupId: string }) {
  const [text, setText] = useState("");

  async function send() {
    if (!text.trim()) return;
    const r = await fetch(`/api/groups/${groupId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (r.ok) {
      setText("");
      // en basit yöntem: sayfayı yenile
      location.reload();
    }
  }

  return (
    <div className="flex gap-2 pt-3 border-t border-white/10">
      <input
        className="input flex-1"
        placeholder="Write a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="btn btn-primary" onClick={send}>Send</button>
    </div>
  );
}
