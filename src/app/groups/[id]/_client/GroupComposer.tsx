"use client";

import { useState } from "react";

export default function GroupComposer({ groupId }: { groupId: string }) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function uploadToR2(file: File) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload/r2", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "upload failed");
    return data.url as string;
  }

  async function submit() {
    setSubmitting(true);
    try {
      let fileUrl: string | undefined;
      if (file) fileUrl = await uploadToR2(file);

      const res = await fetch(`/api/groups/${groupId}/posts`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content, fileUrl }),
      });
      if (!res.ok) throw new Error("post failed");

      setContent("");
      setFile(null);
      window.location.reload(); // basitçe yenile
    } catch (e) {
      console.error(e);
      alert("Failed to post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section-card p-4 space-y-3">
      <textarea
        className="input"
        rows={3}
        placeholder="Share something with the group…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button className="btn btn-primary" disabled={submitting} onClick={submit}>
        {submitting ? "Posting..." : "Post"}
      </button>
    </div>
  );
}
