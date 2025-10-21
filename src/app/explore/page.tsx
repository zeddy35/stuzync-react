import { serverJson } from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ExplorePage({ searchParams }: { searchParams?: { q?: string; section?: string } }) {
  const q = (searchParams?.q || '').trim();
  const section = (searchParams?.section || '').toLowerCase();
  let results: any = { users: [], groups: [], posts: [] };
  let trends: any[] = [];
  try { const d = await serverJson<{ tags: any[] }>("/api/popular-tags"); trends = d.tags || []; } catch {}
  if (q) {
    try { results = await serverJson("/api/search?q=" + encodeURIComponent(q)); } catch {}
  }

  return (
    <div className="page-wrap py-6 space-y-6">
      <header className="section-card p-4">
        <form action="/explore" className="flex items-center gap-2">
          <input name="q" defaultValue={q} placeholder="Search posts, people, groups" className="input flex-1" />
          <button className="btn btn-primary btn-sm" type="submit">Search</button>
        </form>
      </header>

      <section className="space-y-2">
        <h2 className="section-title">Trends</h2>
        <div className="section-card p-4">
          {trends.length === 0 ? (
            <div className="muted">No trends yet.</div>
          ) : (
            <ul className="space-y-1 text-sm">
              {trends.map((t) => (
                <li key={t._id} className="flex items-center justify-between">
                  <Link className="hover:underline" href={`/feed?tag=${encodeURIComponent(t._id)}`}>#{t._id}</Link>
                  <span className="text-xs text-neutral-500">{t.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {q && (
        <>
          <section className="space-y-2">
            <h2 className="section-title">People</h2>
            <div className="section-card p-4">
              {results.users.length === 0 ? (
                <div className="muted">No users found.</div>
              ) : (
                <>
                <ul className="space-y-2">
                  {(results.users as any[]).slice(0, section==='users'?20:5).map((u: any) => (
                    <li key={String(u._id)} className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u.profilePic || '/images/avatar-fallback.svg'} alt="" className="h-8 w-8 rounded-full object-cover" />
                      <Link href={`/profile/${String(u._id)}`} className="font-medium">{`${u.firstName||''} ${u.lastName||''}`.trim()}</Link>
                    </li>
                  ))}
                </ul>
                {results.users.length > 5 && section !== 'users' && (
                  <div className="text-right mt-2"><Link href={`/explore?q=${encodeURIComponent(q)}&section=users`} className="text-emerald-600 hover:underline">Show more</Link></div>
                )}
                </>
              )}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="section-title">Groups</h2>
            <div className="section-card p-4">
              {results.groups.length === 0 ? (
                <div className="muted">No groups found.</div>
              ) : (
                <>
                <ul className="space-y-2">
                  {(results.groups as any[]).slice(0, section==='groups'?20:5).map((g: any) => (
                    <li key={String(g._id)} className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.avatar || '/images/avatar-fallback.svg'} alt="" className="h-8 w-8 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="font-medium">{g.name}</div>
                        {g.description && <div className="text-xs text-neutral-500">{g.description}</div>}
                      </div>
                      <Link href={`/groups/${String(g._id)}`} className="btn btn-ghost btn-xs">Open</Link>
                    </li>
                  ))}
                </ul>
                {results.groups.length > 5 && section !== 'groups' && (
                  <div className="text-right mt-2"><Link href={`/explore?q=${encodeURIComponent(q)}&section=groups`} className="text-emerald-600 hover:underline">Show more</Link></div>
                )}
                </>
              )}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="section-title">Posts</h2>
            <div className="section-card p-4">
              {results.posts.length === 0 ? (
                <div className="muted">No posts found.</div>
              ) : (
                <>
                <ul className="space-y-2">
                  {(results.posts as any[]).slice(0, section==='posts'?20:8).map((p: any, i: number) => (
                    <li key={String(p._id) + i} className="text-sm">
                      {p.author && <span className="font-medium">{p.author.firstName} {p.author.lastName}</span>}{' '}
                      <span className="whitespace-pre-wrap">{p.content}</span>
                    </li>
                  ))}
                </ul>
                {results.posts.length > 8 && section !== 'posts' && (
                  <div className="text-right mt-2"><Link href={`/explore?q=${encodeURIComponent(q)}&section=posts`} className="text-emerald-600 hover:underline">Show more</Link></div>
                )}
                </>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

