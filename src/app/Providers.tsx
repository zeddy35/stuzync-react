'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  // İstersen <SessionProvider session={session}> kullanabilirsin;
  // App Router'da çoğu durumda propssuz yeterli.
  return <SessionProvider>{children}</SessionProvider>;
}
