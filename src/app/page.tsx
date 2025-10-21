// app/(marketing)/landing/page.tsx or wherever you render it
"use client";
import OAuthButtons from "@/components/OAuthButtons";
import { useSearchParams } from "next/navigation";

export default function Landing() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/feed";

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Left: hero */}
      <section className="flex items-center justify-center ">
        <img
          src="/images/StuZync_Favicon.png"
          alt="StuZync"
          width={800}
          height={800}
          className="block w-[40vw] max-w-[800px] h-auto"
        />
      </section>

      {/* Right: auth panel */}
      <section className="flex items-center justify-center ">
        <div className="w-full max-w-sm space-y-6">
          <h1 className="text-3xl font-extrabold">Aradığın notlar burada</h1>
          <p className="text-neutral-500">Hemen katıl.</p>
          <OAuthButtons callbackUrl={next} />
          <div className="my-2 flex items-center gap-3 text-xs text-neutral-500">
            <div className="flex-1 h-px bg-neutral-200/80 dark:bg-white/10" />
            <span>veya</span>
            <div className="flex-1 h-px bg-neutral-200/80 dark:bg-white/10" />
          </div>
          <a href="/register" className="btn btn-primary w-full">Hesap oluştur</a>
          <div className="pt-2">
            <p className="text-neutral-500 text-sm">Zaten bir hesabın var mı?</p>
            <a href="/login" className="btn btn-ghost w-full">Giriş yap</a>
          </div>
        </div>
      </section>
    </main>
  );
}
