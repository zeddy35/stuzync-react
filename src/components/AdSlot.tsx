"use client";

import { useEffect } from "react";

type Props = {
  slot?: string;
  className?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  style?: React.CSSProperties;
};

// Lightweight wrapper for AdSense. When env vars are missing or during dev,
// it renders a subtle placeholder so layout remains stable.
export default function AdSlot({ slot, className = "", format = "auto", style }: Props) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const adSlot = slot || process.env.NEXT_PUBLIC_ADSENSE_SLOT_DEFAULT;
  const isReady = !!client && !!adSlot;

  useEffect(() => {
    if (!isReady) return;
    // Ensure script exists once.
    const id = "adsbygoogle-js";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.async = true;
      s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + client;
      s.crossOrigin = "anonymous" as any;
      document.head.appendChild(s);
    }

    // Push ad request when element mounts.
    // @ts-ignore
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, [client, adSlot, isReady]);

  if (!isReady) {
    return (
      <div
        className={"rounded bg-neutral-200/50 dark:bg-neutral-800/50 text-neutral-500 text-xs flex items-center justify-center " + className}
        style={{ minHeight: 250, ...style }}
      >
        Ad placeholder — set NEXT_PUBLIC_ADSENSE_* envs
      </div>
    );
  }

  return (
    <ins
      className={"adsbygoogle block " + className}
      style={{ display: "block", minHeight: 250, ...(style || {}) }}
      data-ad-client={client}
      data-ad-slot={adSlot}
      data-ad-format={format}
    />
  );
}

