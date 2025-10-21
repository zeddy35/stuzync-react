"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [firstName, setFirst]   = useState("");
  const [lastName, setLast]     = useState("");
  const [school, setSchool]     = useState("");
  const [bio, setBio]           = useState("");
  const [skills, setSkills]     = useState("");      // csv
  const [interests, setInterests] = useState("");    // csv
  const [avatarUrl, setAvatar]  = useState("");
  const [bannerUrl, setBanner]  = useState("");
  const [loading, setLoading]   = useState(false);
  const [upLoading, setUpLoading] = useState<null | "avatar" | "banner">(null);

  useEffect(() => {
    if (status === "authenticated" && !(session as any)?.user?.mustCompleteProfile) {
      router.replace("/feed");
    }
  }, [status, session, router]);

  const disabled = useMemo(() => {
    return !firstName.trim() || !lastName.trim() || !school.trim() || loading;
  }, [firstName, lastName, school, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      school: school.trim(),
      bio: bio.trim(),
      skills: skills.split(",").map(s => s.trim()).filter(Boolean),
      interests: interests.split(",").map(s => s.trim()).filter(Boolean),
      avatarUrl: avatarUrl.trim() || undefined,
      bannerUrl: bannerUrl.trim() || undefined,
      mustCompleteProfile: false,
    };

    const r = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!r.ok) { setLoading(false); alert("Kaydetme başarısız."); return; }

    await fetch("/api/auth/session?update", { cache: "no-store" });
    router.replace("/feed");
  }

 async function uploadAvatar(file?: File) {
  if (!file) return "";
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/upload/avatar", { method: "POST", body: fd });
  if (!r.ok) throw new Error("avatar upload failed");
  const { url } = await r.json();
  return url as string;
}

async function uploadBanner(file?: File) {
  if (!file) return "";
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/upload/banner", { method: "POST", body: fd });
  if (!r.ok) throw new Error("banner upload failed");
  const { url } = await r.json();
  return url as string;
}


  return (
    <section className="page-wrap py-10">
      <div className="section-card max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Hesabı Tamamla</h1>
        <p className="muted mb-4">Ad, soyad ve okul zorunlu; diğer alanlar opsiyonel.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label">Ad</label><input className="input" value={firstName} onChange={e=>setFirst(e.target.value)} required/></div>
            <div><label className="label">Soyad</label><input className="input" value={lastName} onChange={e=>setLast(e.target.value)} required/></div>
          </div>

          <div><label className="label">Okul</label><input className="input" value={school} onChange={e=>setSchool(e.target.value)} required/></div>

          <div><label className="label">Biyografi (opsiyonel)</label><textarea className="input min-h-[96px]" value={bio} onChange={e=>setBio(e.target.value)} /></div>

          <div className="grid grid-cols-2 gap-2">
            <div><label className="label">Yetenekler (virgülle)</label><input className="input" placeholder="react, node, ui/ux" value={skills} onChange={e=>setSkills(e.target.value)} /></div>
            <div><label className="label">İlgi alanları (virgülle)</label><input className="input" placeholder="spor, müzik, yapay zeka" value={interests} onChange={e=>setInterests(e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Avatar (dosya yükle)</label>
              <input
                className="input"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    setUpLoading("avatar");
                    const url = await uploadAvatar(f);
                    setAvatar(url); // input yanındaki URL text alanına da set edebilirsin
                  } finally {
                    setUpLoading(null);
                  }
                }}
              />
              <input
                className="input mt-2"
                placeholder="https://cdn.../avatar.webp"
                value={avatarUrl}
                onChange={(e) => setAvatar(e.target.value)}
              />
              {upLoading==="avatar" && <p className="muted text-sm mt-1">Yükleniyor…</p>}
            </div>
            <div>
                            <input
                className="input"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    setUpLoading("banner");
                    const url = await uploadBanner(f);
                    setBanner(url);
                  } finally {
                    setUpLoading(null);
                  }
                }}
              />
              <input
                className="input mt-2"
                placeholder="https://cdn.../banner.webp"
                value={bannerUrl}
                onChange={(e) => setBanner(e.target.value)}
              />
              {upLoading === "avatar" && <p className="muted text-sm mt-1">Avatar yükleniyor…</p>}
              {upLoading === "banner" && <p className="muted text-sm mt-1">Banner yükleniyor…</p>}
            </div>
          </div>

          <button className="btn btn-primary w-full" disabled={disabled}>
            {loading ? "Kaydediliyor…" : "Kaydet ve Devam"}
          </button>
        </form>
      </div>
    </section>
  );
}
