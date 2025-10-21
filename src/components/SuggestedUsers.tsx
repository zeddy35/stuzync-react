import { serverJson } from "@/lib/fetcher";
import FollowButton from "@/components/FollowButton";

export default async function SuggestedUsers() {
  try {
    const { users } = await serverJson<{ users: Array<{ _id: string; name: string; avatar?: string; followers: number; zyncCount: number }> }>("/api/suggested");
    if (!users || users.length === 0) return null;
    return (
      <aside className="space-y-2">
        <h3 className="text-sm font-semibold">You might be interested</h3>
        <div className="section-card divide-y">
          {users.map((u) => (
            <div key={u._id} className="flex items-center justify-between gap-3 p-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.avatar || "/images/avatar-fallback.svg"} alt="" className="h-8 w-8 rounded-full object-cover" width={32} height={32} />
                <div>
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-xs text-neutral-500">{u.followers} followers · {u.zyncCount} zyncs</div>
                </div>
              </div>
              <FollowButton userId={u._id} initialFollowing={false} />
            </div>
          ))}
        </div>
      </aside>
    );
  } catch {
    return null;
  }
}
