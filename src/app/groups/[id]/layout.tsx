import { ReactNode } from "react";
import { serverJson } from "@/lib/fetcher";

export const dynamic = "force-dynamic";

async function getGroupHeader(id: string) {
  try {
    const { group } = await serverJson<{ group: any }>(`/api/groups/${id}`);
    return group;
  } catch {
    return null;
  }
}

export default async function GroupLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  const g = await getGroupHeader(params.id);
  if (!g) {
    return (
      <section className="page-wrap py-6">
        <div className="section-card p-5">Group not found.</div>
      </section>
    );
  }

  return (
    <section className="page-wrap py-6 space-y-4">
      <div className="section-card p-0 overflow-hidden">
        {g.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={g.cover} alt="" className="w-full h-32 object-cover" />
        ) : (
          <div className="w-full h-20 bg-gradient-to-r from-zync-500/20 to-emerald-400/20" />
        )}
        <div className="p-5">
          <div className="flex items-end gap-4">
            <div className="h-16 w-16 rounded-xl bg-white border border-white/20" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">{g.name}</h1>
              <p className="text-sm text-neutral-500">
                {g.description || "—"} {g.memberCount ? `· ${g.memberCount} members` : ""}
              </p>
            </div>
          </div>
          <nav className="tabs mt-5">
            {[
              { href: `/groups/${g._id}`, label: "Feed" },
              { href: `/groups/${g._id}/chat`, label: "Chat" },
              { href: `/groups/${g._id}/notes`, label: "Notes" },
              { href: `/groups/${g._id}/members`, label: "Members" },
            ].map((t) => (
              <a key={t.href} href={t.href} className="tab">
                {t.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
      {children}
    </section>
  );
}