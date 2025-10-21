import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import Group from "@/models/Group";
import GroupMembership from "@/models/GroupMembership";
import AutoImageUpload from "@/components/AutoImageUpload";
import { serverJson } from "@/lib/api";
import MediaGrid from "@/components/MediaGrid";
import Spinner from "@/components/Spinner";
import { Suspense } from "react";
import GroupPostActions from "@/components/GroupPostActions";
import GroupPostsList from "@/components/GroupPostsList";

export const dynamic = "force-dynamic";

export default async function GroupDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  await dbConnect();

  const group = await Group.findById(params.id).lean();
  if (!group) return <div className="page-wrap py-8"><div className="section-card">Group not found</div></div>;
  const memberCount = await GroupMembership.countDocuments({ group: group._id });
  const membership = await GroupMembership.findOne({ group: group._id, user: (session as any).user.id }).select("role").lean();
  const isMember = !!membership;
  const canManage = !!membership && ["owner","admin","moderator"].includes((membership as any).role);

  let posts: any[] = [];
  try {
    const data = await serverJson<{ posts: any[] }>(`/api/groups/${params.id}/posts`);
    posts = data.posts || [];
  } catch {}

  return (
    <div className="page-wrap py-6 space-y-4">
      <header className="section-card p-0 overflow-hidden">
        {(group as any).cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={(group as any).cover} alt="cover" className="w-full h-40 object-cover" width="1200" height="160" />
        ) : (
          <div className="w-full h-28 bg-gradient-to-r from-emerald-400/20 to-emerald-500/10" />
        )}
        <div className="p-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="h-16 w-16 rounded-full overflow-hidden border border-white/30 bg-white -mt-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={(group as any).avatar || "/images/avatar-fallback.svg"} alt="avatar" className="h-full w-full object-cover" width="64" height="64" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{(group as any).name}</h1>
              {(group as any).description && <p className="text-sm text-neutral-500 mt-1">{(group as any).description}</p>}
              <div className="text-xs text-neutral-500 mt-1">{memberCount} members · {(group as any).visibility}</div>
            </div>
          </div>
          <JoinLeave id={String(group._id)} isMember={isMember} visibility={(group as any).visibility} />
        </div>
        {canManage && (
          <div className="p-4 grid md:grid-cols-2 gap-4">
            <div>
              <AutoImageUpload label="Group cover" action={`/api/groups/${String(group._id)}/upload/cover`} initialUrl={(group as any).cover} />
              <div className="flex items-center gap-2 mt-2">
                <form action={async ()=>{ 'use server'; await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/groups/${String(group._id)}/upload/cover`, { method:'DELETE' }); }}>
                  <button className="btn btn-ghost btn-xs" type="submit">Remove cover</button>
                </form>
                <p className="text-xs text-neutral-500">Wide image, min 1200×300</p>
              </div>
            </div>
            <div>
              <AutoImageUpload label="Group avatar" action={`/api/groups/${String(group._id)}/upload/avatar`} initialUrl={(group as any).avatar} />
              <div className="flex items-center gap-2 mt-2">
                <form action={async ()=>{ 'use server'; await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/groups/${String(group._id)}/upload/avatar`, { method:'DELETE' }); }}>
                  <button className="btn btn-ghost btn-xs" type="submit">Remove avatar</button>
                </form>
                <p className="text-xs text-neutral-500">Square image, min 256×256</p>
              </div>
            </div>
          </div>
        )}
      </header>

      {isMember && <GroupComposer id={String(group._id)} />}

      {canManage && <GroupMetaEditor id={String(group._id)} name={(group as any).name} description={(group as any).description || ''} visibility={(group as any).visibility} />}

      <section className="space-y-3">
        {/* @ts-expect-error Client Component */}
        <GroupPostsList groupId={String(group._id)} initial={posts as any} />
      </section>
    </div>
  );
}

function JoinLeave({ id, isMember, visibility }: { id: string; isMember: boolean; visibility: string }) {
  async function join() { 'use server'; await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/groups/${id}/join`, { method:'POST' }); }
  async function leave() { 'use server'; await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/groups/${id}/join`, { method:'DELETE' }); }
  if (isMember) {
    return (
      <form action={async () => { await leave(); }}><button className="btn btn-ghost btn-sm" type="submit">Leave</button></form>
    );
  }
  return visibility === 'public' ? (
    <form action={async () => { await join(); }}><button className="btn btn-secondary btn-sm" type="submit">Join</button></form>
  ) : (
    <div className="text-xs text-neutral-500">Private group</div>
  );
}

function GroupComposer({ id }: { id: string }) {
  async function create(previousState: any, formData: FormData) {
    'use server';
    const content = String(formData.get('content')||'').trim();
    const filesRaw = String(formData.get('files')||'');
    const fileUrl = String(formData.get('fileUrl')||'').trim() || undefined;
    const files = filesRaw ? filesRaw.split(',').map(s=>s.trim()).filter(Boolean).slice(0,9) : [];
    if (!content && !fileUrl && files.length===0) return { error: 'Empty' };
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/groups/${id}`, { method:'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ content, fileUrl, files }) });
    return { ok: true };
  }
  return (
    <form action={create as any} className="section-card p-4 space-y-2">
      <textarea name="content" className="input min-h-24" placeholder="Share something with the group…" />
      <AttachmentPicker />
      <div className="flex justify-end"><button className="btn btn-primary btn-sm" type="submit">Post</button></div>
    </form>
  );
}

function GroupMetaEditor({ id, name, description, visibility }: { id: string; name: string; description: string; visibility: string }) {
  async function save(_: any, fd: FormData) {
    'use server';
    const body = { name: String(fd.get('name')||'').trim(), description: String(fd.get('description')||'').trim(), visibility: String(fd.get('visibility')||'public') };
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/groups/${id}/settings`, { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) });
    return { ok: true };
  }
  return (
    <form action={save as any} className="section-card p-4 space-y-3">
      <h3 className="font-semibold">Group settings</h3>
      <div className="grid md:grid-cols-2 gap-3">
        <input className="input" name="name" defaultValue={name} placeholder="Group name" required />
        <select className="input" name="visibility" defaultValue={visibility}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>
      <textarea className="input min-h-24" name="description" defaultValue={description} placeholder="Group bio" />
      <div className="flex justify-end">
        <button className="btn btn-primary btn-sm">Save</button>
      </div>
    </form>
  );
}

// Client-only attachment picker that uploads to R2 and writes URLs into hidden fields
function AttachmentPicker() {
  'use client';
  const [images, setImages] = (require('react') as typeof import('react')).useState<string[]>([]);
  const [fileUrl, setFileUrl] = (require('react') as typeof import('react')).useState<string>("");
  const imgRef = (require('react') as typeof import('react')).useRef<HTMLInputElement|null>(null);
  const pdfRef = (require('react') as typeof import('react')).useRef<HTMLInputElement|null>(null);
  const [uploading, setUploading] = (require('react') as typeof import('react')).useState(false);
  return (
    <div>
      <input type="hidden" name="files" value={images.join(',')} />
      <input type="hidden" name="fileUrl" value={fileUrl} />
      <div className="flex items-center gap-2">
        <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={async (e)=>{
          const files = Array.from(e.target.files || []);
          if (!files.length) return;
          setUploading(true);
          try {
            const uploaded: string[] = [];
            for (const f of files.slice(0, 9 - images.length)) {
              const fd = new FormData(); fd.append('file', f);
              const r = await fetch('/api/upload/r2', { method: 'POST', body: fd });
              if (!r.ok) throw new Error(await r.text());
              const data = await r.json(); if (data?.url) uploaded.push(data.url);
            }
            if (uploaded.length) setImages(prev => [...prev, ...uploaded]);
          } finally { setUploading(false); if (imgRef.current) imgRef.current.value = ""; }
        }} />
        <button type="button" className="btn btn-ghost btn-xs" onClick={()=>imgRef.current?.click()} disabled={uploading}>Add image(s)</button>
        <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={async (e)=>{
          const f = e.target.files?.[0]; if (!f) return; setUploading(true);
          try { const fd = new FormData(); fd.append('file', f); const r = await fetch('/api/upload/pdf', { method: 'POST', body: fd }); if (!r.ok) throw new Error(await r.text()); const data = await r.json(); setFileUrl(data.url||''); } finally { setUploading(false); if (pdfRef.current) pdfRef.current.value=''; }
        }} />
        <button type="button" className="btn btn-ghost btn-xs" onClick={()=>pdfRef.current?.click()} disabled={uploading}>Add PDF</button>
        {uploading && <span className="text-xs text-neutral-500">Uploading…</span>}
      </div>
      {(images.length>0 || fileUrl) && (
        <div className="mt-2 space-y-2">
          {images.length>0 && (
            <div className="grid grid-cols-2 gap-2">
              {images.map((u,i)=> (
                <div key={i} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt="attachment" className="rounded-lg w-full object-cover max-h-64" width="600" height="256" />
                  <button type="button" className="btn btn-ghost btn-xs absolute top-1 right-1" onClick={()=> setImages(prev => prev.filter((_,idx)=>idx!==i))}>✕</button>
                </div>
              ))}
            </div>
          )}
          {fileUrl && (/\.pdf($|\?)/i.test(fileUrl) ? <a className="text-sm text-emerald-600 underline" href={fileUrl} target="_blank">Attached PDF</a> : <img src={fileUrl} alt="attachment" className="rounded-lg max-h-64" width="600" height="256" />)}
        </div>
      )}
    </div>
  );
}
