"use client";

import { useState } from "react";

export default function InviteForm({ groupId }: { groupId: string }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true); setMsg(null);
    try {
      const res = await fetch(`/api/groups/${groupId}/members/invite`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg("Invited"); setEmail("");
    } catch (e: any) {
      setMsg(e?.message || "Failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 mb-3">
      <input className="input flex-1" placeholder="Invite by email" value={email} onChange={(e)=>setEmail(e.target.value)} />
      <button className="btn btn-primary" disabled={pending}>{pending?"Inviting...":"Invite"}</button>
      {msg && <span className="text-xs text-neutral-500">{msg}</span>}
    </form>
  );
}

