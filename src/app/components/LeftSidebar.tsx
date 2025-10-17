export default function LeftSidebar() {
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Kategoriler</h3>
        <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
          <li><a href="/feed?tag=duyuru" className="hover:underline">📢 Duyurular</a></li>
          <li><a href="/feed?tag=etkinlik" className="hover:underline">🎫 Etkinlikler</a></li>
          <li><a href="/feed?tag=not" className="hover:underline">📝 Ders Notları</a></li>
        </ul>
      </div>
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Reklam</h3>
        <div className="rounded bg-neutral-200/50 h-[250px] flex items-center justify-center text-neutral-500 text-sm">
          Ad Left (300×250)
        </div>
      </div>
    </div>
  );
}
