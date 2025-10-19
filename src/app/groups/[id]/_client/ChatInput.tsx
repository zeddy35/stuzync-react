"use client";

import { useState } from "react";

export default function ChatInput({ groupId }: { groupId: string }) {
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!content.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("send failed");
      setContent("");
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="section-card p-3 flex gap-2">
      <input
        className="input flex-1"
        placeholder="Write a message…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button className="btn btn-primary" disabled={busy} onClick={send}>
        Send
      </button>
    </div>
  );
}
