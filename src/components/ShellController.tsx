"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ShellController() {
  const pathname = usePathname() || "/";
  useEffect(() => {
    const hide =
      pathname === "/" ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/(auth)");
    const el = document.documentElement;
    if (hide) el.classList.add("no-shell");
    else el.classList.remove("no-shell");
  }, [pathname]);
  return null;
}

