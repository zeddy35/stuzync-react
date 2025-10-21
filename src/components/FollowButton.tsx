"use client";

import { useState } from "react";
import { showToast } from "@/lib/toastBus";

export default function FollowButton({ userId, initialFollowing }: { userId: string; initialFollowing: boolean }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setPending(true);
    const method = following ? "DELETE" : "POST";
    setFollowing(!following);
    const res = await fetch(`/api/users/${userId}/follow`, { method });
    if (!res.ok) {
      setFollowing(following);
      showToast({ text: "Failed to update follow", variant: "error" });
    } else {
      showToast({ text: following ? "Unfollowed" : "Followed", variant: "success" });
    }
    setPending(false);
  }

  return (
    <button className="btn btn-secondary" onClick={toggle} disabled={pending}>
      {pending ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}

