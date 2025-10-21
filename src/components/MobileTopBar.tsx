"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function MobileTopBar() {
  const { data: session } = useSession();
  const me = (session as any)?.user;
  return (
    <div className="lg:hidden sticky top-0 z-50 bg-white/80 dark:bg-[#0b1020]/80 backdrop-blur border-b border-white/40 dark:border-white/10">
      <div className="max-w-[1280px] mx-auto px-4 h-12 flex items-center justify-between">
        <Link href="/" className="font-semibold">StuZync</Link>
        <div className="flex items-center gap-2">
          <Link href="/post/new" className="btn btn-primary btn-xs">Post</Link>
          {me ? (
            <Link href={`/profile/${me.id}`} aria-label="Profile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={me.image || "/images/avatar-fallback.svg"} alt="" className="h-7 w-7 rounded-full object-cover" width="28" height="28" />
            </Link>
          ) : (
            <Link href="/login" className="btn btn-ghost btn-xs">Login</Link>
          )}
        </div>
      </div>
    </div>
  );
}
