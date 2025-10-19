"use client";

import { signIn } from "next-auth/react";
import GoogleIcon from "@/components/icons/GoogleIcon";
import GitHubIcon from "@/components/icons/GitHubIcon";

export default function OAuthButtons() {
  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="btn btn-ghost w-full flex items-center justify-center gap-2"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <button
        type="button"
        onClick={() => signIn("github", { callbackUrl: "/" })}
        className="btn btn-ghost w-full flex items-center justify-center gap-2"
      >
        <GitHubIcon />
        Continue with GitHub
      </button>
    </div>
  );
}
