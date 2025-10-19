export default function RightSidebar({ popularTags }: { popularTags: any[] }) {
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Popüler Etiketler</h3>
        <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
          {popularTags?.map(t => (
            <li key={t._id}>
              <a className="hover:underline" href={`/feed?tag=${encodeURIComponent(t._id)}`}>#{t._id}</a> ({t.count})
            </li>
          ))}
        </ul>
      </div>
      <div className="card p-4">
        <h3 className="font-semibold mb-2">Sponsorlu</h3>
        <div className="rounded bg-neutral-200/50 h-[250px] flex items-center justify-center text-neutral-500 text-sm">
          Ad Right (300×250)
        </div>
      </div>
    </div>
  );
}
