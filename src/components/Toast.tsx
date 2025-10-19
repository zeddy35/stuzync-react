// src/components/Toast.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function Toast() {
  const sp = useSearchParams();
  const router = useRouter();

  const successMsg = sp.get("success");
  const errorMsg = sp.get("error");
  const [visible, setVisible] = useState(true);

  const content = useMemo(() => {
    if (successMsg) return { text: successMsg, cls: "toast toast-success" };
    if (errorMsg) return { text: errorMsg, cls: "toast toast-error" };
    return null;
  }, [successMsg, errorMsg]);

  useEffect(() => {
    if (!content) return;
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, [content]);

  // optional: remove query after show
  useEffect(() => {
    if (!content || !visible) {
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [content, visible]);

  if (!content || !visible) return null;

  return (
    <div className={`fixed top-20 right-4 ${content.cls}`}>
      {content.text}
    </div>
  );
}
