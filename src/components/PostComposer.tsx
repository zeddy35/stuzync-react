'use client';
import { useState, useRef } from 'react';

export default function PostComposer({ me }: { me: any }) {
  const [file, setFile] = useState<File|null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form action="/api/post/create" method="post" encType="multipart/form-data"
      className="rounded-xl border border-white/20 bg-white/70 dark:bg-white/10 backdrop-blur p-4 space-y-3"
    >
      <div className="flex gap-3">
        <img
          src={me?.profilePic ? `/uploads/${me.profilePic}` :
            `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(me?.name||'U')}`}
          className="w-10 h-10 rounded-full object-cover"
          alt=""
        />
        <textarea name="content" rows={2} required
          placeholder="Aklında ne var?"
          className="input flex-1"
        />
      </div>

      <input name="tags" placeholder="Etiketler (virgül: not, duyuru, etkinlik)" className="input w-full"/>

      {/* preview box */}
      <div className={`border border-dashed rounded p-3 ${file ? '' : 'hidden'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl">
              {file?.type.startsWith('image/') ? '🖼️' :
               file?.type==='application/pdf' ? '📄' : '📎'}
            </div>
            <span className="text-sm">{file?.name}</span>
          </div>
          <button type="button" className="text-red-500 text-xs" onClick={()=>{
            if (fileRef.current) fileRef.current.value='';
            setFile(null);
          }}>Kaldır</button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
          <span>Görsel/video/PDF ekle</span>
          <input ref={fileRef} type="file" name="file"
            accept="image/*,video/*,application/pdf" className="hidden"
            onChange={(e)=> setFile(e.target.files?.[0] || null)}
          />
        </label>
        <button className="btn btn-primary" type="submit">Paylaş</button>
      </div>
    </form>
  );
}
