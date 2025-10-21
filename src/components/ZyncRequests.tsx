"use client";

import { useState } from "react";

type UserLite = { _id: string; firstName?: string; lastName?: string; profilePic?: string };

export default function ZyncRequests({ received, sent }: { received: UserLite[]; sent: UserLite[] }) {
  const [rec, setRec] = useState(received);
  const [snt, setSnt] = useState(sent);

  async function accept(id: string) {
    try { await fetch(`/api/connect/accept/${id}`, { method: 'POST' }); setRec((r)=> r.filter(u=>u._id!==id)); } catch {}
  }
  async function decline(id: string) {
    try { await fetch(`/api/connect/decline/${id}`, { method: 'POST' }); setRec((r)=> r.filter(u=>u._id!==id)); } catch {}
  }
  async function cancel(id: string) {
    try { await fetch(`/api/connect/cancel/${id}`, { method: 'POST' }); setSnt((r)=> r.filter(u=>u._id!==id)); } catch {}
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="section-card">
        <h2 className="font-semibold mb-3">Incoming Requests</h2>
        {rec.length === 0 ? (
          <p className="muted text-sm">No incoming requests.</p>
        ) : (
          <ul className="space-y-3">
            {rec.map((u)=> (
              <li key={u._id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.profilePic || "/images/avatar-fallback.svg"} className="h-9 w-9 rounded-full object-cover" alt="" />
                  <a href={`/profile/${u._id}`} className="font-medium">{`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'User'}</a>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-primary btn-xs" onClick={()=>accept(u._id)}>Accept</button>
                  <button className="btn btn-ghost btn-xs" onClick={()=>decline(u._id)}>Ignore</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="section-card">
        <h2 className="font-semibold mb-3">Sent Requests</h2>
        {snt.length === 0 ? (
          <p className="muted text-sm">No pending sent requests.</p>
        ) : (
          <ul className="space-y-3">
            {snt.map((u)=> (
              <li key={u._id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u.profilePic || "/images/avatar-fallback.svg"} className="h-9 w-9 rounded-full object-cover" alt="" />
                  <a href={`/profile/${u._id}`} className="font-medium">{`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'User'}</a>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-ghost btn-xs" onClick={()=>cancel(u._id)}>Cancel</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
