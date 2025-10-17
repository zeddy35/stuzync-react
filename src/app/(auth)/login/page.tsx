"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  return (
    <div className="min-h-[70vh] grid place-items-center p-6">
      <div className="w-full max-w-md bg-white/10 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
        <form onSubmit={async (e)=>{e.preventDefault(); await signIn("credentials", { email, password, callbackUrl: "/"});}} className="space-y-4">
          <div><label className="block text-sm mb-1">Email</label>
            <input className="w-full px-3 py-2 rounded bg-black/20 border border-white/10"
              type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div><label className="block text-sm mb-1">Password</label>
            <input className="w-full px-3 py-2 rounded bg-black/20 border border-white/10"
              type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded">Login</button>
        </form>
        <div className="mt-4 text-center text-sm">
          <button onClick={()=>signIn("google",{callbackUrl:"/"})} className="underline">Continue with Google</button>
        </div>
      </div>
    </div>
  );
}
