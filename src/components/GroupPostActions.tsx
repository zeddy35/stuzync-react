"use client";

import { useState } from "react";

export default function GroupPostActions({ groupId, postId, initialLiked, initialLikes, initialComments }: { groupId: string; postId: string; initialLiked: boolean; initialLikes: number; initialComments: number; }) {
  const [liked, setLiked] = useState(!!initialLiked);
  const [likes, setLikes] = useState(initialLikes || 0);
  const [comments] = useState(initialComments || 0);

  async function toggleLike() {
    const next = !liked; setLiked(next); setLikes((c)=> c + (next?1:-1));
    const method = next ? 'POST' : 'DELETE';
    const r = await fetch(`/api/groups/${groupId}/posts/${postId}/like`, { method });
    if (!r.ok) { setLiked(!next); setLikes((c)=> c + (next?-1:1)); } else { const d = await r.json(); if (typeof d.likes === 'number') setLikes(d.likes); }
  }

  return (
    <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-300">
      <button className="btn btn-ghost btn-xs" onClick={toggleLike}>{liked ? 'Unlike' : 'Like'}</button>
      <span>{likes} {likes===1 ? 'like' : 'likes'}</span>
      <span>· {comments} {comments===1 ? 'comment' : 'comments'}</span>
    </div>
  );
}

