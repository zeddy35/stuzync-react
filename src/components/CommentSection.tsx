"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";

type Comment = {
  _id: string;
  text: string;
  author?: { _id?: string; firstName?: string; lastName?: string; profilePic?: string };
};

export default function CommentSection({ postId }: { postId: string }) {
  const { status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch(`/api/comments?postId=${postId}`, { cache: "no-store" });
        if (!r.ok) throw new Error(await r.text());
        const data = await r.json();
        if (mounted) setComments(data.comments || []);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [postId]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    startTransition(async () => {
      setError(null);
      // optimistic add
      const optimistic: Comment = { _id: `tmp-${Date.now()}`, text: value };
      setComments((c) => [...c, optimistic]);
      setText("");
      try {
        const r = await fetch(`/api/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, text: value }),
        });
        if (!r.ok) throw new Error(await r.text());
        const { commentId } = await r.json();
        setComments((c) => c.map((x) => (x._id === optimistic._id ? { ...x, _id: String(commentId) } : x)));
      } catch (e: any) {
        setError(e?.message || "Failed to comment");
        setComments((c) => c.filter((x) => x._id !== optimistic._id));
      }
    });
  }

  async function onDelete(id: string) {
    // optimistic remove
    const before = comments;
    setComments((c) => c.filter((x) => x._id !== id));
    const r = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (!r.ok) setComments(before);
  }

  return (
    <div className="mt-3">
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 w-2/3 rounded bg-neutral-200/70 dark:bg-white/10 animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-neutral-200/70 dark:bg-white/10 animate-pulse" />
        </div>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => {
            const canDelete = c.author && c.author._id && (session as any)?.user?.id
              ? String(c.author._id) === String((session as any).user.id)
              : false;
            return (
              <li key={c._id} className="text-sm flex items-start gap-2">
                <span className="font-medium shrink-0">{c.author ? `${c.author.firstName ?? ""} ${c.author.lastName ?? ""}` : "You"}</span>
                <span className="whitespace-pre-wrap flex-1">{c.text}</span>
                {canDelete && (
                  <button className="btn btn-ghost btn-xs" onClick={() => onDelete(c._id)}>Delete</button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {status === "authenticated" && (
        <form onSubmit={submit} className="mt-2 flex items-center gap-2">
          <input
            className="input flex-1"
            placeholder="Write a comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
          />
          <button className="btn btn-secondary" disabled={pending || !text.trim()}>
            {pending ? "Sending…" : "Send"}
          </button>
        </form>
      )}

      {error && <div className="toast toast-error mt-2">{error}</div>}
    </div>
  );
}
