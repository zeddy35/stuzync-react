"use client";

import { useState, useTransition } from "react";

type Props = {
  postId: string;
  initialFavorited?: boolean;
  className?: string;
};

export default function FavoriteButton({ postId, initialFavorited = false, className }: Props) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  async function toggle() {
    startTransition(async () => {
      // optimistic
      setFavorited((f) => !f);
      const res = await fetch(`/api/post/${postId}/favorite`, { method: "POST" });
      if (!res.ok) {
        // revert if failed
        setFavorited((f) => !f);
        // TODO: toast error
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`icon-btn ${className ?? ""}`}
      aria-pressed={favorited}
      title={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <span className="mr-1">{favorited ? "★" : "☆"}</span>
      <span className="text-sm">{favorited ? "Favorited" : "Favorite"}</span>
    </button>
  );
}
