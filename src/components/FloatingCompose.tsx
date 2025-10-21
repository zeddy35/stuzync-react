"use client";

import Link from "next/link";

export default function FloatingCompose() {
  return (
    <Link
      href="/post/new"
      className="lg:hidden fixed bottom-16 right-4 z-50 rounded-full bg-emerald-600 text-white shadow-lg px-5 py-3 hover:bg-emerald-700 active:bg-emerald-800"
      aria-label="Compose post"
    >
      Post
    </Link>
  );
}

