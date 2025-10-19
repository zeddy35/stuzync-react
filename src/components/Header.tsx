// src/components/Header.tsx
"use client";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#0b1020]/70 backdrop-blur border-b border-white/50 dark:border-white/10">
      <div className="mx-auto max-w-[1280px] px-4 h-14 flex items-center justify-between">
        <a className="font-semibold" href="/">StuZync</a>
        <nav className="hidden md:flex gap-3 text-sm">
          <a href="/about" className="px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Biz Kimiz?</a>
          <a href="/blog" className="px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Blog</a>
          <a href="/docs" className="px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Dokumanlar</a>
          <a href="/login" className="px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Login</a>
        </nav>
      </div>
    </header>
  );
}

