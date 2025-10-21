"use client";

import { useState } from "react";

type Role = "admin" | "moderator" | "member";

export default function RoleMenu({ groupId, userId, initial }: { groupId: string; userId: string; initial: Role }) {
  const [role, setRole] = useState<Role>(initial);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/members/role`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, role })
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e) {
      alert("Failed to update role");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select className="input h-9" value={role} onChange={(e)=>setRole(e.target.value as Role)}>
        <option value="admin">admin</option>
        <option value="moderator">moderator</option>
        <option value="member">member</option>
      </select>
      <button className="btn btn-ghost h-9 px-3" onClick={save} disabled={pending}>Save</button>
    </div>
  );
}

