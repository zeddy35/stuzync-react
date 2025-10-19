export const dynamic = "force-dynamic";

type Member = { _id: string; name: string; role: "admin" | "moderator" | "member"; avatar?: string };

async function getMembers(id: string): Promise<Member[]> {
  // TODO: /api/groups/:id/members GET
  return [
    { _id: "u1", name: "Admin", role: "admin" },
    { _id: "u2", name: "Bob", role: "member" },
  ];
}

export default async function GroupMembersPage({ params }: { params: { id: string } }) {
  const users = await getMembers(params.id);

  return (
    <div className="section-card p-4">
      <h2 className="text-lg font-semibold mb-3">Members</h2>
      <ul className="space-y-2">
        {users.map(u => (
          <li key={u._id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-neutral-900/5 dark:bg-white/10" />
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-neutral-500">{u.role}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <a className="btn btn-ghost h-9 px-3" href={`/profile/${u._id}`}>View</a>
              {/* Admin ise roller/manage butonları eklenebilir */}
            </div>
          </li>
        ))}
      </ul>
       </div>
  );
}
