// src/app/page.tsx
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main className="page-wrap mt-10">
      <div className="section-card max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold">StuZync</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300 max-w-2xl">
          Birlikte çalış, akıllıca senkronize ol. Basit ve hızlı bir işbirliği deneyimi.
        </p>

        <div className="mt-6 flex gap-3">
          <a className="btn btn-primary" href="/register">Hemen Başla</a>
          <a className="btn btn-ghost" href="/login">Giriş Yap</a>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <section className="section-card">
          <h2 className="text-xl font-semibold">Biz Kimiz?</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Öğrenciler ve ekipler için pratik üretkenlik araçları geliştiriyoruz. Odak: sade deneyim.
          </p>
          <a className="btn btn-ghost mt-3" href="#about">Daha fazla oku</a>
        </section>

        <section className="section-card">
          <h2 className="text-xl font-semibold">Blog</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            Ürün güncellemeleri, ipuçları ve vaka çalışmaları. Yakında.
          </p>
          <a className="btn btn-ghost mt-3" href="#blog">Bloga git</a>
        </section>

        <section className="section-card">
          <h2 className="text-xl font-semibold">Dokümanlar</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
            API ve entegrasyonlar için hızlı dokümantasyon. Yakında.
          </p>
          <a className="btn btn-ghost mt-3" href="#docs">Dokümanları aç</a>
        </section>
      </div>
    </main>
  );
}
