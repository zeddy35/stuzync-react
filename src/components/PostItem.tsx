"use client";

import { useSession } from "next-auth/react";
import { useTransition, useState } from "react";
import CommentSection from "@/components/CommentSection";
import { showToast } from "@/lib/toastBus";
import MediaGrid from "@/components/MediaGrid";

type Author = { firstName?: string; lastName?: string; profilePic?: string; _id?: string };
type Post = { _id: string; author?: Author; content?: string; likes?: string[] };

export default function PostItem({ post }: { post: Post }) {
  const { data: session } = useSession();
  const [deleting, startDel] = useTransition();
  const [gone, setGone] = useState(false);
  const [undoTimer, setUndoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const userId = (session as any)?.user?.id;
  const [liked, setLiked] = useState(() => !!(post.likes || []).some((id) => String(id) === String(userId)));
  const [likeCount, setLikeCount] = useState(() => post.likes?.length || 0);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(post.content || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (gone && undoTimer) {
    return (
      <div className="section-card flex items-center justify-between">
        <span>This post will be deleted. Undo?</span>
        <button className="btn btn-ghost btn-sm" onClick={() => { if (undoTimer) { clearTimeout(undoTimer); setUndoTimer(null); setGone(false); } }}>Undo</button>
      </div>
    );
  }
  if (gone) return null;

  const canDelete = session?.user && (session as any).user.id && post?.author && (post.author as any)?._id
    ? String((session as any).user.id) === String((post.author as any)._id)
    : false;
  const canEdit = canDelete;

  async function onDelete() {
    if (undoTimer) return; // already scheduled
    // Soft-delete locally and schedule server delete
    setGone(true);
    const t = setTimeout(async () => {
      const r = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
      setUndoTimer(null);
      if (!r.ok) {
        // restore if failed
        setGone(false);
        showToast({ text: "Failed to delete post", variant: "error" });
      } else {
        showToast({ text: "Post deleted", variant: "success" });
      }
    }, 5000);
    setUndoTimer(t);
    showToast({
      text: "Post will be deleted",
      variant: "info",
      durationMs: 5000,
      actionLabel: "Undo",
      onAction: () => {
        if (t) clearTimeout(t);
        setUndoTimer(null);
        setGone(false);
      },
    });
  }

  async function toggleLike() {
    if (!userId) return;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => c + (nextLiked ? 1 : -1));
    const method = nextLiked ? "POST" : "DELETE";
    const r = await fetch(`/api/posts/${post._id}/like`, { method });
    if (!r.ok) {
      // revert
      setLiked(!nextLiked);
      setLikeCount((c) => c + (nextLiked ? -1 : 1));
    } else {
      // sync with server value
      const data = await r.json();
      if (typeof data.likes === "number") setLikeCount(data.likes);
    }
  }

  return (
    <article className="section-card" id={`post-${post._id}`}>
      <header className="flex items-center gap-3">
        <img
          src={post.author?.profilePic || "/images/avatar-fallback.svg"}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
          width="40"
          height="40"
        />
        <div className="font-medium flex-1">
          {post.author?.firstName} {post.author?.lastName}
        </div>
        {canDelete && (
          <button className="btn btn-ghost btn-sm" onClick={onDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
        {canEdit && (
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing((e) => !e)} disabled={deleting}>
            {editing ? "Cancel" : "Edit"}
          </button>
        )}
      </header>

      {!editing ? (
        <>
          {post.content && (
            <p className="mt-3 whitespace-pre-wrap">{post.content}</p>
          )}
          {Array.isArray((post as any).files) && (post as any).files.length > 0 ? (
            <MediaGrid files={(post as any).files as string[]} />
          ) : (
            (post as any).fileUrl && (
              <div className="mt-3">
                {/\.pdf($|\?)/i.test(String((post as any).fileUrl)) ? (
                  <a href={String((post as any).fileUrl)} target="_blank" className="text-sm text-emerald-600 underline">View PDF</a>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={String((post as any).fileUrl)} alt="attachment" className="max-h-80 rounded-lg" width="800" height="600" />
                )}
              </div>
            )
          )}
        </>
      ) : (
        <div className="mt-3 space-y-2">
          <textarea className="input min-h-24" value={value} onChange={(e)=>setValue(e.target.value)} maxLength={1000} />
          {err && <div className="toast toast-error">{err}</div>}
          <div className="flex justify-end">
            <button
              className="btn btn-primary btn-sm"
              disabled={saving || !value.trim()}
              onClick={async () => {
                setSaving(true); setErr(null);
                const res = await fetch(`/api/posts/${post._id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content: value.trim() }),
                });
                if (!res.ok) {
                  setErr(await res.text());
                } else {
                  (post as any).content = value.trim();
                  setEditing(false);
                }
                setSaving(false);
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
        <button className="btn btn-ghost btn-sm" onClick={toggleLike} disabled={!userId}>
          {liked ? "Unlike" : "Like"}
        </button>
        <span>{likeCount} {likeCount === 1 ? "like" : "likes"}</span>
      </div>

      <CommentSection postId={post._id} />
    </article>
  );
}
