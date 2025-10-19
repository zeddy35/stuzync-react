import Link from "next/link";

async function getGroup(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/groups/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getPosts(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/groups/${id}/posts`, { cache: "no-store" });
  if (!res.ok) return { posts: [] };
  return res.json();
}

export default async function GroupPage({ params }: { params: { id: string } }) {
  const [{ group }, { posts }] = await Promise.all([getGroup(params.id), getPosts(params.id)]);

  if (!group) {
    return <div className="page-wrap py-8"><div className="section-card">Group not found.</div></div>;
  }

  return (
    <div className="page-wrap py-6 space-y-6">
      <div className="section-card p-5">
        <h1 className="text-xl font-semibold">{group.name}</h1>
        <p className="text-sm text-neutral-500">{group.description || "—"}</p>
        <div className="mt-3 flex gap-2 text-sm">
          <Link href={`/groups/${group._id}/chat`} className="btn btn-ghost">Group Chat</Link>
          <Link href={`/groups/${group._id}/notes`} className="btn btn-ghost">Notes</Link>
        </div>
      </div>

      {/* Composer (Client) */}

      <GroupComposer groupId={params.id} />

      <div className="space-y-3">
        {posts.map((p: any) => (
          <article key={p._id} className="section-card p-4">
            <div className="flex items-center gap-2 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.author?.profilePic || "/images/avatar-fallback.png"} className="h-6 w-6 rounded-full" alt="" />
              <b>{p.author?.name || "User"}</b>
              <span className="text-neutral-500">· {new Date(p.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap">{p.content}</p>
            {p.fileUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.fileUrl} alt="" className="mt-3 rounded-lg border border-white/10" />
            )}

            <LikeButton groupId={params.id} postId={p._id} initialLikes={p.likes?.length ?? 0} />
          </article>
        ))}
      </div>
    </div>
  );
}

import GroupComposer from "./_client/GroupComposer";
import LikeButton from "./_client/LikeButton";
