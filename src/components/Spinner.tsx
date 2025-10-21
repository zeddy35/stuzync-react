"use client";

export default function Spinner({ size = 24 }: { size?: number }) {
  const s = `${size}px`;
  return (
    <div
      aria-label="Loading"
      className="inline-block align-middle border-2 border-current border-t-transparent rounded-full animate-spin"
      style={{ width: s, height: s }}
    />
  );
}

