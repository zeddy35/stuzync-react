"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { emit, FEED_CHANNELS } from "@/lib/feedBus";

export default function PostComposer() {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null); // pdf or single legacy
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const imgInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    setSubmitting(true);
    setError(null);
    try {
      // optimistic: add temporary post to feed
      const tmpId = `tmp-${Date.now()}`;
      const optimisticPost = {
        _id: tmpId,
        content: text,
        author: {
          _id: (session as any)?.user?.id,
          firstName: (session as any)?.user?.name?.split(" ")?.[0] || "",
          lastName: (session as any)?.user?.name?.split(" ")?.slice(1).join(" ") || "",
          profilePic: (session as any)?.user?.image || undefined,
        },
        likes: [],
        fileUrl: fileUrl || undefined,
        files: images,
      } as any;
      emit(FEED_CHANNELS.PostAdded, optimisticPost);

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, fileUrl: fileUrl || undefined, files: images }),
      });
      if (!res.ok) throw new Error(await res.text());
      setContent("");
      setFileUrl(null);
      setImages([]);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="section-card">
        <textarea
          className="input min-h-24"
          placeholder="What’s happening?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
        />
        {(fileUrl || images.length > 0) && (
          <div className="mt-3">
            {fileUrl && /\.pdf($|\?)/i.test(fileUrl) ? (
              <a href={fileUrl} target="_blank" className="text-sm text-emerald-600 underline">Attached PDF</a>
            ) : null}
            {/* images grid */}
            {images.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {images.map((url, idx) => (
                  <div key={idx} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="attachment" className="max-h-64 w-full object-cover rounded-lg" />
                    <button type="button" className="btn btn-ghost btn-xs absolute top-1 right-1" onClick={()=>setImages(imgs=>imgs.filter((_,i)=>i!==idx))}>✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2">
              {fileUrl && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFileUrl(null)}>Remove attachment</button>}
            </div>
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden" onChange={async (e)=>{
              const files = Array.from(e.target.files || []);
              if (files.length === 0) return;
              setUploading(true);
              try {
                const uploaded: string[] = [];
                for (const f of files.slice(0, 9 - images.length)) {
                  const fd = new FormData();
                  fd.append("file", f);
                  const r = await fetch("/api/upload/r2", { method: "POST", body: fd });
                  if (!r.ok) throw new Error(await r.text());
                  const data = await r.json();
                  if (data?.url) uploaded.push(data.url);
                }
                if (uploaded.length) setImages((prev) => [...prev, ...uploaded]);
              } catch (err) {
                // ignore in composer, error toast could be added
              } finally {
                setUploading(false);
                if (imgInputRef.current) imgInputRef.current.value = "";
              }
            }} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={()=>imgInputRef.current?.click()} disabled={uploading}>Add image(s)</button>

            <input ref={pdfInputRef} type="file" accept="application/pdf" className="hidden" onChange={async (e)=>{
              const f = e.target.files?.[0];
              if (!f) return;
              setUploading(true);
              try {
                const fd = new FormData();
                fd.append("file", f);
                const r = await fetch("/api/upload/pdf", { method: "POST", body: fd });
                if (!r.ok) throw new Error(await r.text());
                const data = await r.json();
                setFileUrl(data.url);
              } catch (err) {
              } finally {
                setUploading(false);
                if (pdfInputRef.current) pdfInputRef.current.value = "";
              }
            }} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={()=>pdfInputRef.current?.click()} disabled={uploading}>Add PDF</button>
            {uploading && <span className="text-xs text-neutral-500">Uploading…</span>}
          </div>
          <span className="text-xs text-neutral-500">{content.length}/1000</span>
        </div>
        {error && <div className="toast toast-error mt-2">{error}</div>}
        <div className="mt-3 flex items-center justify-end">
          <button className="btn btn-primary" disabled={submitting || !content.trim()}>
            {submitting ? "Posting…" : "Post"}
          </button>
        </div>
      </form>

      {submitting && (
        <div className="section-card animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-neutral-200/70 dark:bg-white/10" />
            <div className="h-3 w-32 rounded bg-neutral-200/70 dark:bg-white/10" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-neutral-200/70 dark:bg-white/10" />
            <div className="h-3 w-11/12 rounded bg-neutral-200/70 dark:bg-white/10" />
          </div>
        </div>
      )}
    </div>
  );
}
