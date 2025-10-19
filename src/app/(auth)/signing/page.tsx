// src/app/(auth)/signing/page.tsx
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <section className="flex items-center justify-center py-12 page-wrap">
      <div className="w-full max-w-md bg-white/80 dark:bg-white/5 backdrop-blur-lg rounded-xl p-6 shadow-soft border border-white/50 dark:border-white/10">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>

        <form action="/api/auth/[...nextauth]" method="POST" className="space-y-4">
          {/* next-auth credentials kullanıyorsan backend tarafını ayarladık zaten */}
          <input type="hidden" name="callbackUrl" value="/feed" />
          <input type="hidden" name="csrf" value="" />

          <div>
            <label htmlFor="email" className="label">Email</label>
            <input type="email" name="email" id="email" required className="input" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input type="password" name="password" id="password" required className="input" placeholder="Your password" />
          </div>

          <button type="submit" className="w-full btn btn-primary">Login</button>
        </form>

        <div className="mt-4 text-center text-neutral-400">
          <a href="/forgot-password" className="text-sm hover:underline">Forgot password?</a>
        </div>
        <p className="mt-4 text-center text-neutral-400 text-sm">
          Don&apos;t have an account? <a href="/register" className="font-medium hover:underline">Sign up</a>
        </p>
      </div>
    </section>
  );
}
