"use client";

import { useState } from "react";

export default function FeedComposer() {
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);

  async function submit() {
    setPending(true);
    try {
      const res = await fetch("/api/posts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content }) });
      if (!res.ok) throw new Error(await res.text());
      setContent("");
      window.location.reload();
    } catch (e) {
      alert("Failed to post");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="section-card p-4 space-y-3">
      <textarea className="input" rows={3} placeholder="What is happening?" value={content} onChange={(e)=>setContent(e.target.value)} />
      <div className="flex justify-end">
        <button className="btn btn-primary" onClick={submit} disabled={pending || !content.trim()}>
          {pending ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}

