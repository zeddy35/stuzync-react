"use client";

import { useRef, useState } from "react";

type Props = {
  label: string;
  action: "/api/upload/avatar" | "/api/upload/banner";
  initialUrl?: string | null;
  className?: string;
};

export default function AutoImageUpload({ label, action, initialUrl, className }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | undefined>(initialUrl || undefined);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setErr(null);
    setMsg(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // anında local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // otomatik yükle
    const fd = new FormData();
    fd.append("file", file);

    setUploading(true);
    try {
      const res = await fetch(action, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json().catch(() => ({}));
      // sunucu { ok:true, url } döndürüyor
      if (data?.url) setPreview(data.url);
      setMsg("Saved ✓");
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={`section-card space-y-3 ${className || ""}`}>
      <div className="flex items-center justify-between">
        <label className="label">{label}</label>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          title="Select image"
        >
          {uploading ? "Uploading…" : "Change"}
        </button>
      </div>

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt={label}
          className={`rounded-lg w-full object-cover ${action.endsWith("banner") ? "h-40" : "h-28 w-28"}`}
        />
      ) : (
        <div
          className={`rounded-lg bg-white/50 dark:bg-white/5 border border-white/20 flex items-center justify-center text-sm text-neutral-500 ${
            action.endsWith("banner") ? "h-40" : "h-28 w-28"
          }`}
        >
          No {label.toLowerCase()}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      <div className="text-xs flex gap-3">
        {msg && <span className="text-emerald-600 dark:text-emerald-400">{msg}</span>}
        {err && <span className="text-red-600 dark:text-red-400">{err}</span>}
      </div>

      <p className="text-xs text-neutral-500">
        Tip: 2–4MB altında, geniş banner (min 1200×300) ve kare avatar (min 256×256) önerilir.
      </p>
    </div>
  );
}
