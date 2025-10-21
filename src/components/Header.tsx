'use client';

import { useSession, signOut } from 'next-auth/react';
import NotificationsBell from '@/components/NotificationsBell';
import Link from 'next/link';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#0b1020]/70 backdrop-blur border-b border-white/50 dark:border-white/10">
      <div className="mx-auto max-w-[1280px] px-4 h-14 flex items-center justify-between">
        <Link className="font-semibold" href="/">StuZync</Link>
        <nav className="hidden md:flex gap-3 text-sm items-center">
          <NotificationsBell />
          <Link href="/feed" className="px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Keşfet</Link>
          {session?.user ? (
            <>
              <Link href={`/profile/${(session as any).user.id}`} className="px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">
                {(session.user as any)?.name || 'Profil'}
              </Link>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">
                Çıkış
              </button>
            </>
          ) : (
            <Link href="/login" className="px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10">Giriş Yap</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
