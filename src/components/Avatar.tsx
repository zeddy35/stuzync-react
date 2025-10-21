"use client";

// Türkçe: CDN üzerinden görsel yükleyen Avatar bileşeni. Hata olursa
// public/images/avatar-fallback.svg gösterilir. Mevcut UI class'ları korunur.

import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";

type Props = {
  src?: string | null;
  size?: number;
  className?: string;
  alt?: string;
};

export default function Avatar({ src, size = 40, className, alt = "Kullanıcı avatarı" }: Props) {
  const [errored, setErrored] = useState(false);
  const showFallback = errored || !src;

  return (
    <div className={clsx("inline-block overflow-hidden rounded-full", className)} style={{ width: size, height: size }}>
      {showFallback ? (
        <Image
          src="/images/avatar-fallback.svg"
          alt={alt}
          width={size}
          height={size}
          className="object-cover w-full h-full"
        />
      ) : (
        <Image
          src={src as string}
          alt={alt}
          width={size}
          height={size}
          className="object-cover w-full h-full"
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}
