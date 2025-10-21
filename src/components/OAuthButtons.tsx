"use client";
import { signIn } from "next-auth/react";
import GoogleIcon from "@/components/icons/GoogleIcon";
import GitHubIcon from "@/components/icons/GitHubIcon";

export default function OAuthButtons({ callbackUrl = "/feed" }: { callbackUrl?: string }) {
  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="btn btn-ghost w-full flex items-center justify-center gap-2"
      >
        <GoogleIcon />
        Google ile devam et
      </button>

      {/*
      <button
        type="button"
        onClick={() => signIn("github", { callbackUrl })}
        className="btn btn-ghost w-full flex items-center justify-center gap-2"
      >
        <GitHubIcon />
        GitHub ile devam et
      </button>
      */}
    </div>
  );
}
