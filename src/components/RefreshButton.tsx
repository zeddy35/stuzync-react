"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function RefreshButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      className={`icon-btn ${className ?? ""}`}
      title="Refresh"
    >
      ⟳ <span className="ml-1 text-sm">{pending ? "Refreshing..." : "Refresh"}</span>
    </button>
  );
}
