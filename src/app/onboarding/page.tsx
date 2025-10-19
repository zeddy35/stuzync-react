"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [school, setSchool] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/me/complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName, lastName, school }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.replace("/");
    } catch (e: any) {
      setError(e?.message || "Failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="page-wrap mt-10">
      <div className="section-card max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold">Hesabı Tamamla</h1>
        <p className="text-sm text-neutral-500 mt-1">Profil bilgilerini doldur, ardından feed'e yönlendirelim.</p>
        <form className="mt-6 grid gap-3" onSubmit={submit}>
          <div>
            <label className="block text-sm mb-1">Ad</label>
            <input className="input input-bordered w-full" value={firstName} onChange={e=>setFirstName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Soyad</label>
            <input className="input input-bordered w-full" value={lastName} onChange={e=>setLastName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Okul (opsiyonel)</label>
            <input className="input input-bordered w-full" value={school} onChange={e=>setSchool(e.target.value)} />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button className="btn btn-primary" disabled={pending}>{pending ? "Kaydediliyor..." : "Kaydet ve Devam"}</button>
        </form>
      </div>
    </section>
  );
}
