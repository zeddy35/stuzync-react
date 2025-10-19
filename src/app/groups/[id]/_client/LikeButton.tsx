"use client";

import { useState } from "react";

export default function LikeButton({
  groupId,
  postId,
  initialLikes,
}: {
  groupId: string;
  postId: string;
  initialLikes: number;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLikes(data.likes ?? likes);
      } else {
        alert(data?.message || "Failed");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className="icon-btn mt-3" onClick={toggle} disabled={busy}>
      ❤️ {likes}
    </button>
  );
}
