// src/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/50 dark:border-white/10">
      <div className="mx-auto max-w-[1280px] px-4 py-12 grid gap-6 sm:grid-cols-3 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span>⚡</span><b>StuZync</b>
          </div>
          <p className="text-neutral-500">Birlikte çalış, akıllıca senkronize ol.</p>
        </div>
        <div className="space-y-1 text-neutral-500">
          <a href="#blog">Blog</a><br />
          <a href="#docs">Dokumanlar</a>
        </div>
        <div className="space-y-1 text-neutral-500">
          <a href="#about">Hakkımızda</a><br />
          <a href="#contact">İletişim</a>
        </div>
      </div>
    </footer>
  );
}
