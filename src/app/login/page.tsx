"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import OAuthButtons from "@/components/OAuthButtons";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError(res.error);
      } else {
        window.location.href = "/"; // istersen /feed
      }
    });
  };

  return (
    <section className="page-wrap py-10">
      <div className="section-card max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
        <p className="muted mb-4">E-mail + password veya Google/LinkedIn ile giriş yap.</p>

        <OAuthButtons />
        <div className="divider my-4" />

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              className="input"
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="toast toast-error">{error}</div>}

          <button className="btn btn-primary w-full" type="submit" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-neutral-500 text-sm">
          New here? <a href="/register" className="hover:underline">Create an account</a>
        </p>
      </div>
    </section>
  );
}
