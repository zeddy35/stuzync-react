"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import PasswordStrength from "@/components/PasswordStrength";
import KvkkConsent from "@/components/KvkkConsent";
import OAuthButtons from "@/components/OAuthButtons";
import PhoneField from "@/components/PhoneField";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="page-wrap py-10">
      <div className="section-card max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Create your account</h1>

        {/* OAuth */}
        <OAuthButtons />

        {/* divider */}
        <div className="my-4 flex items-center gap-3 text-xs text-neutral-500">
          <div className="flex-1 h-px bg-neutral-200/80 dark:bg-white/10" />
          <span>or</span>
          <div className="flex-1 h-px bg-neutral-200/80 dark:bg-white/10" />
        </div>

        {/* Email/password form */}
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setPending(true);
          const form = e.currentTarget as HTMLFormElement;
          const fd = new FormData(form);
          try {
            const res = await fetch('/api/register', {
              method: 'POST',
              body: fd,
            });
            if (!res.ok) throw new Error(await res.text());
            // auto sign-in then go to onboarding
            const email = String(fd.get('email') || '');
            const pw = String(fd.get('password') || '');
            const r = await signIn('credentials', { email, password: pw, redirect: false });
            if (r?.error) throw new Error(r.error);
            router.replace('/onboarding');
          } catch (err: any) {
            setError(err?.message || 'Failed to register');
          } finally {
            setPending(false);
          }
        }}>
          <div>
            <label className="label" htmlFor="name">Full name</label>
            <input
              className="input"
              id="name"
              name="name"
              placeholder="Full name"
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              placeholder="you@school.edu"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="school">School</label>
            <input
              className="input"
              id="school"
              name="school"
              placeholder="University / High School"
              autoComplete="organization"
            />
          </div>

          <div>
            <label className="label">Phone (optional)</label>
            {/* Ülke kodu + numara inline */}
            <PhoneField />
          </div>

          
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              className="input"
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 karakter (büyük/küçük harf ve rakam)" // Güncellendi
              autoComplete="new-password"
              required
              minLength={8} // Eklendi: Minimum uzunluk
              // Eklendi: Regex ile kural denetimi
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$" 
              // Eklendi: Hata durumunda gösterilecek mesaj
              title="Şifreniz en az 8 karakter uzunluğunda olmalı ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* ✅ artık controlled; bar canlı güncellenir */}
            <div className="mt-2">
              <PasswordStrength value={password} />
            </div>
          </div>

          <KvkkConsent />

          {error && <div className="toast toast-error">{error}</div>}
          <button className="btn btn-primary w-full" type="submit" disabled={pending}>
            {pending ? 'Creating…' : 'Sign up'}
          </button>
        </form>

        <p className="mt-4 text-center text-neutral-500 text-sm">
          Already have an account?{" "}
          <a href="/login" className="hover:underline">Login</a>
        </p>
      </div>
    </section>
  );
}
