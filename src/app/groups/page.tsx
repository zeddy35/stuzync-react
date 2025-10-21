import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serverJson } from "@/lib/api";

export const dynamic = "force-dynamic";

async function GroupCard({ g, action }: { g: any; action?: React.ReactNode }) {
  return (
    <div className="section-card p-0 overflow-hidden">
      {g.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={g.cover} alt="cover" className="w-full h-24 object-cover" width="1200" height="96" />
      ) : (
        <div className="w-full h-16 bg-gradient-to-r from-emerald-400/20 to-emerald-500/10" />
      )}
      <div className="p-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full overflow-hidden border border-white/30 bg-white -mt-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.avatar || "/images/avatar-fallback.svg"} alt="avatar" className="h-full w-full object-cover" width="48" height="48" />
          </div>
          <div>
            <div className="font-semibold">{g.name}</div>
           {g.description && <div className="text-sm text-neutral-500 mt-1">{g.description}</div>}
           <div className="text-xs text-neutral-500 mt-1">{g.memberCount || 0} members</div>
          </div>
        </div>
        {action}
      </div>
    </div>
  );
}

export default async function GroupsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  let my: any[] = [];
  let pub: any[] = [];
  try {
    const data = await serverJson<{ groups: any[] }>("/api/groups"); my = data.groups || [];
  } catch {}
  try {
    const data = await serverJson<{ groups: any[] }>("/api/groups/public"); pub = data.groups || [];
  } catch {}

  return (
    <div className="page-wrap py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Groups</h1>

      {/* Create */}
      <CreateGroupForm />

      {/* My groups */}
      <section className="space-y-3">
        <h2 className="section-title">Your groups</h2>
        {my.length === 0 ? (
          <div className="muted">You haven’t joined any groups yet.</div>
        ) : (
          my.map((g: any) => <GroupCard key={String(g._id)} g={g} action={<a className="btn btn-secondary btn-sm" href={`/groups/${g._id}`}>Open</a>} />)
        )}
      </section>

      {/* Explore public groups */}
      <section className="space-y-3">
        <h2 className="section-title">Explore public groups</h2>
        {pub.length === 0 ? (
          <div className="muted">No public groups yet.</div>
        ) : (
          pub.map((g: any) => <JoinableGroup key={String(g._id)} g={g} />)
        )}
      </section>
    </div>
  );
}

function CreateGroupForm() {
  return (
    <form
      className="section-card p-4 space-y-3"
      action={async (formData: FormData) => {
        "use server";
      }}
      onSubmit={undefined as any}
    >
      <h2 className="section-title">Create a group</h2>
      <div className="grid md:grid-cols-2 gap-3">
        <input className="input" name="name" placeholder="Group name" required />
        <select className="input" name="privacy" defaultValue="public">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>
      <textarea className="input min-h-24" name="description" placeholder="Description (optional)" />
      <button
        className="btn btn-primary"
        formAction={async (fd: FormData) => {
          'use server';
          const name = String(fd.get('name')||'');
          const description = String(fd.get('description')||'');
          const privacy = String(fd.get('privacy')||'public');
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/groups`, { method:'POST', body: JSON.stringify({ name, description, privacy }), headers: { 'Content-Type':'application/json' } });
        }}
      >
        Create
      </button>
    </form>
  );
}

function JoinableGroup({ g }: { g: any }) {
  async function join(id: string) {
    'use server';
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/groups/${id}/join`, { method: 'POST' });
  }
  return (
    <GroupCard
      g={g}
      action={
        <form action={async () => { await join(String(g._id)); }}>
          <button className="btn btn-secondary btn-sm" type="submit">Join</button>
        </form>
      }
    />
  );
}

