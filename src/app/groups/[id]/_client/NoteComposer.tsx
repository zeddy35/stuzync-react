"use client";

import { useState } from "react";

export default function NoteComposer({ groupId }: { groupId: string }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/notes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("note failed");
      setTitle(""); setContent("");
      window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="section-card p-4 space-y-2">
      <input className="input" placeholder="Note title" value={title} onChange={(e)=>setTitle(e.target.value)} />
      <textarea className="input" rows={4} placeholder="Content…" value={content} onChange={(e)=>setContent(e.target.value)} />
      <button className="btn btn-primary" onClick={submit} disabled={busy}>{busy?"Saving…":"Save note"}</button>
    </div>
  );
}
