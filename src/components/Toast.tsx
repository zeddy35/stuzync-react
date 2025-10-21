// src/components/Toast.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { onToast, clearToast, type ToastPayload } from "@/lib/toastBus";

export default function Toast() {
  const sp = useSearchParams();

  // Query-driven one-off messages
  const successMsg = sp.get("success");
  const errorMsg = sp.get("error");

  const queryContent = useMemo<ToastPayload | null>(() => {
    if (successMsg) return { text: successMsg, variant: "success", durationMs: 3000 };
    if (errorMsg) return { text: errorMsg, variant: "error", durationMs: 3000 };
    return null;
  }, [successMsg, errorMsg]);

  const [queue, setQueue] = useState<(ToastPayload & { id: string })[]>([]);
  const timerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [position, setPosition] = useState<string>("top-right");

  useEffect(() => onToast((t) => {
    if (!t) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    setQueue((q) => [{ ...t, id }, ...q].slice(0, 5)); // cap at 5
    const dur = t.durationMs ?? 3000;
    timerRef.current[id] = setTimeout(() => dismiss(id), dur);
  }), []);

  // Seed from query once on mount
  useEffect(() => {
    if (!queryContent) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    setQueue((q) => [{ ...queryContent, id }, ...q]);
    const dur = queryContent.durationMs ?? 3000;
    timerRef.current[id] = setTimeout(() => dismiss(id), dur);
    // clear query params immediately so reloads don't re-add
    const url = new URL(window.location.href);
    url.searchParams.delete("success");
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss(id: string) {
    clearTimeout(timerRef.current[id]);
    delete timerRef.current[id];
    setQueue((q) => q.filter((x) => x.id !== id));
    clearToast();
  }

  // Positioning: configurable via env, responsive default to bottom-left on small screens
  useEffect(() => {
    const envPos = (process.env.NEXT_PUBLIC_TOAST_POSITION || "").toLowerCase();
    function pick() {
      const isMobile = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 640px)").matches;
      if (envPos === "bottom-left" || envPos === "bottom-right" || envPos === "bottom-center" || envPos === "top-left" || envPos === "top-right" || envPos === "top-center") {
        return envPos;
      }
      return isMobile ? "bottom-left" : "top-right";
    }
    setPosition(pick());
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(max-width: 640px)");
      const handler = () => setPosition(pick());
      mq.addEventListener?.("change", handler);
      return () => mq.removeEventListener?.("change", handler);
    }
  }, []);

  function positionClass() {
    switch (position) {
      case "bottom-left":
        return "fixed bottom-4 left-4";
      case "bottom-right":
        return "fixed bottom-4 right-4";
      case "bottom-center":
        return "fixed bottom-4 left-1/2 -translate-x-1/2";
      case "top-left":
        return "fixed top-20 left-4";
      case "top-center":
        return "fixed top-20 left-1/2 -translate-x-1/2";
      case "top-right":
      default:
        return "fixed top-20 right-4";
    }
  }

  if (queue.length === 0) return null;

  return (
    <div className={`${positionClass()} space-y-2`}> 
      {queue.map((t) => {
        const cls = t.variant === "success" ? "toast toast-success"
          : t.variant === "error" ? "toast toast-error" : "toast";
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 transition-all duration-300 ease-out transform opacity-100 ${cls}`}
          >
            <span>{t.text}</span>
            {t.actionLabel && t.onAction && (
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => { t.onAction?.(); dismiss(t.id); }}
              >
                {t.actionLabel}
              </button>
            )}
            <button className="btn btn-ghost btn-xs" onClick={() => dismiss(t.id)}>✕</button>
          </div>
        );
      })}
    </div>
  );
}
