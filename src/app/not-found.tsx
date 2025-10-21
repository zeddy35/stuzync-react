// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-dvh grid place-items-center p-8 text-center">
      <div>
        <h1 className="text-3xl font-semibold">Sayfa bulunamadı</h1>
        <p className="mt-2 opacity-80">Aradığın sayfa taşınmış veya silinmiş olabilir.</p>
        <div className="mt-6">
          <Link href="/" className="underline underline-offset-4">Ana sayfaya dön</Link>
        </div>
      </div>
    </main>
  );
}
