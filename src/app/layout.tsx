import './globals.css';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <body className="min-h-full bg-gray-50 text-neutral-900 dark:bg-[#0b1020] dark:text-neutral-100">
        <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#0b1020]/70 backdrop-blur border-b border-white/50 dark:border-white/10">
          <div className="mx-auto max-w-[1280px] px-4 h-14 flex items-center justify-between">
            <a className="font-semibold" href="/">⚡ StuZync</a>
            <nav className="hidden md:flex gap-3 text-sm">
              <a href="/feed" className="px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Feed</a>
              <a href="/login" className="px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Login</a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="mt-20 border-t border-white/50 dark:border-white/10">
          <div className="mx-auto max-w-[1280px] px-4 py-12 grid gap-6 sm:grid-cols-3 text-sm">
            <div>
              <div className="flex items-center gap-2 mb-2"><span>⚡</span><b>StuZync</b></div>
              <p className="text-neutral-500">Birlikte çalış, akıllıca senkronize ol.</p>
            </div>
            <div className="space-y-1 text-neutral-500"><a href="#">Blog</a><br/><a href="#">Dokümanlar</a></div>
            <div className="space-y-1 text-neutral-500"><a href="#">Hakkımızda</a><br/><a href="#">İletişim</a></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
