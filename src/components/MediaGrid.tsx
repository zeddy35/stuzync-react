"use client";

import { useEffect, useRef, useState } from "react";

export default function MediaGrid({ files }: { files: string[] }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const count = Math.min(files.length, 9);
  const maxThumbs = count > 4 ? 4 : count;
  const display = files.slice(0, maxThumbs);

  function openAt(i: number) {
    setIdx(i);
    setOpen(true);
  }

  function layoutClass() {
    if (maxThumbs === 1) return "grid-cols-1";
    if (maxThumbs === 2) return "grid-cols-2";
    if (maxThumbs === 3) return "grid-cols-2 grid-rows-2";
    return "grid-cols-2"; // 4 thumbs
  }

  return (
    <div className="mt-3">
      <div className={`grid gap-2 ${layoutClass()}`}>
        {display.map((url, i) => {
          const isFirstTall = maxThumbs === 3 && i === 0; // first spans two rows for 3-grid
          const isLastOverlay = i === display.length - 1 && files.length > display.length; // show +N on last tile
          const more = files.length - display.length;
          return (
            <button
              type="button"
              key={i}
              onClick={() => openAt(i)}
              className={`relative group overflow-hidden rounded-lg border border-white/10 bg-black/5 ${isFirstTall ? "row-span-2" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="media" className={`w-full h-full object-cover ${maxThumbs === 1 ? "max-h-[500px]" : "max-h-64"}`} width={maxThumbs===1?1200:600} height={maxThumbs===1?500:256} />
              {isLastOverlay && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-semibold">
                  +{more}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {open && (
        <Lightbox images={files} index={idx} onClose={() => setOpen(false)} />)
      }
    </div>
  );
}

function Lightbox({ images, index, onClose }: { images: string[]; index: number; onClose: () => void }) {
  const [i, setI] = useState(index);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function prev() { setI((x) => (x - 1 + images.length) % images.length); }
  function next() { setI((x) => (x + 1) % images.length); }

  // Keyboard navigation: Esc to close, arrows to navigate
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Basic swipe support
  function onTouchStart(e: React.TouchEvent) {
    const t = e.changedTouches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    const s = touchStart.current; if (!s) return;
    touchStart.current = null;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x; const dy = t.clientY - s.y;
    if (Math.abs(dx) > 40 && Math.abs(dy) < 60) {
      if (dx > 0) prev(); else next();
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={onClose}>
      <div className="absolute top-4 right-4">
        <button className="btn btn-ghost btn-sm text-white" onClick={onClose}>✕</button>
      </div>
      <div
        ref={wrapRef}
        className="relative max-w-5xl w-[90vw]"
        onClick={(e)=>e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[i]} alt="media" className="max-h-[80vh] w-full object-contain rounded-lg" width={1200} height={800} />
        {images.length > 1 && (
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
            <button className="pointer-events-auto btn btn-ghost btn-sm text-white" onClick={prev} aria-label="Previous">‹</button>
            <button className="pointer-events-auto btn btn-ghost btn-sm text-white" onClick={next} aria-label="Next">›</button>
          </div>
        )}
      </div>
    </div>
  );
}
