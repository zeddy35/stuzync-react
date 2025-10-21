export const dynamic = "force-dynamic";
import { serverJson } from "@/lib/fetcher";
import InviteForm from "./_client/InviteForm";
import RoleMenu from "./_client/RoleMenu";

type Member = { _id: string; name: string; role: "admin" | "moderator" | "member"; avatar?: string };

async function getMembers(id: string): Promise<{ members: Member[]; canInvite: boolean; canSetRoles: boolean }> {
  const data = await serverJson<{ members: Member[]; canInvite: boolean; canSetRoles: boolean }>(`/api/groups/${id}/members`);
  return { members: data.members || [], canInvite: !!data.canInvite, canSetRoles: !!data.canSetRoles };
}

export default async function GroupMembersPage({ params }: { params: { id: string } }) {
  const { members: users, canInvite, canSetRoles } = await getMembers(params.id);

  return (
    <div className="section-card p-4">
      <h2 className="text-lg font-semibold mb-3">Members</h2>
      {canInvite && <InviteForm groupId={params.id} />}
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u._id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u.avatar || "/images/avatar-fallback.svg"} alt="" className="h-9 w-9 rounded-full object-cover" />
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-neutral-500">{u.role}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <a className="btn btn-ghost h-9 px-3" href={`/profile/${u._id}`}>View</a>
              {canSetRoles && <RoleMenu groupId={params.id} userId={u._id} initial={u.role} />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
