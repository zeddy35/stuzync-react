async function getNotes(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/groups/${id}/notes`, { cache: "no-store" });
  if (!res.ok) return { notes: [] };
  return res.json();
}

export default async function GroupNotesPage({ params }: { params: { id: string } }) {
  const { notes } = await getNotes(params.id);
  return (
    <div className="page-wrap py-6 space-y-4">
      <NoteComposer groupId={params.id} />
      {notes.map((n: any) => (
        <div key={n._id} className="section-card p-4">
          <div className="flex items-center gap-2 text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="h-6 w-6 rounded-full" src={n.author?.profilePic || "/images/avatar-fallback.png"} alt="" />
            <b>{n.author?.name || "User"}</b>
            <span className="text-neutral-500">· {new Date(n.createdAt).toLocaleString()}</span>
          </div>
          <h3 className="text-lg font-semibold mt-2">{n.title}</h3>
          <p className="mt-1 whitespace-pre-wrap">{n.content}</p>
        </div>
      ))}
    </div>
  );
}

import NoteComposer from "../_client/NoteComposer";
