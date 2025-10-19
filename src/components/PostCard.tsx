"use client";

import FavoriteButton from "@/components/FavoriteButton";

type UserLite = { name: string; profilePic?: string | null };
type PostDoc = {
  _id: string;
  author: UserLite;
  content?: string;
  fileUrl?: string | null;
  createdAt: string;
  likes: string[];
  isFlagged: boolean;
  sharedFrom?: { author: UserLite } | null;
};

export default function PostCard({
  post,
  initialFavorited = false,
}: { post: PostDoc; initialFavorited?: boolean }) {
  return (
    <article className="section-card p-4 text-sm space-y-3">
      <div className="flex items-center gap-3">
        <img
          src={
            post.author?.profilePic ||
            "/images/avatar-fallback.png"
          }
          className="w-10 h-10 rounded-full object-cover ring-elevated"
          alt={post.author?.name ?? "User"}
        />
        <div>
          <div className="font-medium">{post.author?.name || "User"}</div>
          <div className="muted">{new Date(post.createdAt).toLocaleString()}</div>
        </div>
      </div>

      {post.sharedFrom && (
        <div className="text-xs text-neutral-500">
          Shared from <b>{post.sharedFrom.author?.name ?? "User"}</b>
        </div>
      )}

      {post.content && <p className="leading-relaxed whitespace-pre-line">{post.content}</p>}

      {post.fileUrl && (
        /\.(png|jpe?g|gif|webp|bmp|avif)$/i.test(post.fileUrl)
          ? <img src={post.fileUrl} className="rounded-lg max-h-[26rem] w-full object-cover" alt="attachment"/>
          : <a href={post.fileUrl} target="_blank" className="btn btn-ghost mt-2">Open file</a>
      )}

      <div className="flex items-center justify-between border-t border-white/10 pt-3">
        <div className="flex gap-3">
          <form action={`/api/post/${post._id}/like`} method="post">
            <button className="icon-btn" title="Like">👍 <span className="text-sm">{post.likes?.length ?? 0}</span></button>
          </form>
          <form action={`/api/post/${post._id}/share`} method="post">
            <button className="icon-btn" title="Share">🔁</button>
          </form>
          <FavoriteButton postId={post._id} initialFavorited={initialFavorited} />
        </div>

        {post.isFlagged && <span className="text-xs text-red-500">Under review</span>}
      </div>
    </article>
  );
}
