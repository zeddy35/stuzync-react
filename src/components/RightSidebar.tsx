import AdSlot from "./AdSlot";
import SuggestedUsers from "./SuggestedUsers";
import { serverJson } from "@/lib/fetcher";
import Link from "next/link";
import SearchBox from "@/components/SearchBox";

async function TrendsServer() {
  try {
    const data = await serverJson<{ tags: Array<{ _id: string; count: number }> }>("/api/popular-tags");
    const tags = data.tags || [];
    return (
      <div className="section-card p-4">
        <h3 className="font-semibold mb-2">What’s happening</h3>
        <ul className="space-y-1 text-sm text-neutral-600 dark:text-neutral-300">
          {tags.map((t) => (
            <li key={t._id} className="flex items-center justify-between">
              <a className="hover:underline" href={`/feed?tag=${encodeURIComponent(t._id)}`}>#{t._id}</a>
              <span className="text-xs text-neutral-500">{t.count}</span>
            </li>
          ))}
          {tags.length === 0 && <li className="muted text-sm">No trends yet.</li>}
        </ul>
      </div>
    );
  } catch {
    return (
      <div className="section-card p-4">
        <h3 className="font-semibold mb-2">What’s happening</h3>
        <div className="muted text-sm">Unable to load trends.</div>
      </div>
    );
  }
}

export default function RightSidebar() {
  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-10">
        {/* @ts-expect-error Client Component */}
        <SearchBox />
      </div>

      {/* Trends (server fetch) */}
      {/* @ts-expect-error Server Component */}
      <TrendsServer />

      {/* Suggestions */}
      <div className="p-0">
        <SuggestedUsers />
      </div>

      <div className="section-card p-3">
        <h3 className="font-semibold mb-2">Sponsored</h3>
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RIGHT} />
      </div>
    </div>
  );
}
