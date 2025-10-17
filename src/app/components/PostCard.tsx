'use client';
import { useState, FormEvent } from 'react';

export default function PostCard({ post, me }: { post: any, me: any }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);

  async function like(e: FormEvent) {
    e.preventDefault();
    const r = await fetch(`/api/post/${post._id}/like`, { method: 'POST' });
    if (r.ok) setLikes(x => x + (post.likes?.includes(me?._id) ? -1 : 1));
  }

  return (
    <article className="rounded-xl border border-white/20 bg-white/70 dark:bg-white/10 backdrop-blur p-4 text-sm space-y-3">
      <div className="flex items-center gap-3">
        <img
          src={post.author?.profilePic ? `/uploads/${post.author.profilePic}` :
            `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(post.author?.name||'U')}`}
          className="w-10 h-10 rounded-full object-cover" alt=""
        />
        <div>
          <div className="font-medium">{post.author?.name || 'User'}</div>
          <div className="muted">{new Date(post.createdAt).toLocaleString()}</div>
        </div>
      </div>

      {post.content && <p className="leading-relaxed whitespace-pre-line">{post.content}</p>}

      {post.fileUrl && (
        /\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(post.fileUrl)
          ? <img src={post.fileUrl} className="rounded-lg max-h-[26rem] w-full object-cover" alt=""/>
          : <a href={post.fileUrl} target="_blank" className="underline">Ek dosyayı aç</a>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex gap-3">
          <form onSubmit={like}><button className="hover:underline">👍 Beğen ({likes})</button></form>
          <form action={`/api/post/${post._id}/share`} method="post">
            <button className="hover:underline">🔁 Paylaş</button>
          </form>
        </div>
        <form action={`/api/post/${post._id}/comment`} method="post" className="flex gap-2">
          <input name="text" required placeholder="Yorum ekle…" className="input h-8"/>
          <button className="btn btn-sm btn-primary">Gönder</button>
        </form>
      </div>
    </article>
  );
}
