"use client";

import { useEffect, useState } from "react";

type Mode = "light" | "dim" | "dark";

export default function ThemeSwitcher() {
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme") as Mode | null;
      if (saved) setMode(saved);
      else setMode(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    } catch {}
  }, []);

  function apply(next: Mode) {
    setMode(next);
    try {
      localStorage.setItem("theme", next);
      document.documentElement.classList.remove("dark", "dim");
      if (next === "dark") document.documentElement.classList.add("dark");
      else if (next === "dim") document.documentElement.classList.add("dim");
    } catch {}
  }

  return (
    <div className="section-card p-3">
      <div className="text-sm font-semibold mb-2">Appearance</div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <button className={`btn btn-ghost ${mode==='light'?'ring-1 ring-emerald-500':''}`} onClick={()=>apply('light')}>Light</button>
        <button className={`btn btn-ghost ${mode==='dim'?'ring-1 ring-emerald-500':''}`} onClick={()=>apply('dim')}>Dim</button>
        <button className={`btn btn-ghost ${mode==='dark'?'ring-1 ring-emerald-500':''}`} onClick={()=>apply('dark')}>Dark</button>
      </div>
    </div>
  );
}

