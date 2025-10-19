export const dynamic = "force-dynamic";

type Group = {
  _id: string;
  name: string;
  description?: string;
  memberCount?: number;
  cover?: string;
};

async function getGroups(): Promise<Group[]> {
  // TODO: /api/groups GET bağla
  return [
    { _id: "demo-1", name: "StuZync Devs", description: "Developers @ campus", memberCount: 42 },
    { _id: "demo-2", name: "AI Study Club", description: "LLMs, CV, NLP", memberCount: 18 },
  ];
}

export default async function GroupsPage() {
  const groups = await getGroups();

  return (
    <section className="page-wrap py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Groups</h1>
        <a href="/groups/new" className="btn btn-primary">Create group</a>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map(g => (
          <a key={g._id} href={`/groups/${g._id}`} className="section-card p-5 block hover:opacity-95 transition">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-zync-500/20 to-emerald-400/20" />
              <div>
                <div className="font-medium">{g.name}</div>
                <div className="text-sm text-neutral-500">
                  {g.description || "—"} {g.memberCount ? `· ${g.memberCount} members` : ""}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
