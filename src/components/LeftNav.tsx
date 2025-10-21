"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  me?: { id: string; name?: string | null; image?: string | null } | null;
};

function Icon({ name }: { name: string }) {
  const map: Record<string, string> = {
    home: "🏠",
    explore: "🔎",
    zync: "🤝",
    lists: "📋",
    bookmarks: "🔖",
    communities: "👥",
    profile: "👤",
    more: "⋯",
  };
  return <span aria-hidden className="text-lg leading-none w-5 text-center">{map[name] || "•"}</span>;
}

export default function LeftNav({ me }: Props) {
  const pathname = usePathname();
  const links: Array<{ href: string; label: string; icon: string; requireAuth?: boolean }> = [
    { href: "/feed", label: "Home", icon: "home" },
    { href: "/explore", label: "Explore", icon: "explore" },
    { href: "/zync", label: "Zync", icon: "zync" },
    { href: "/lists", label: "Lists", icon: "lists" },
    { href: "/bookmarks", label: "Bookmarks", icon: "bookmarks" },
    { href: "/communities", label: "Communities", icon: "communities" },
  ];

  function isActive(href: string) {
    if (!pathname) return false;
    if (href === "/feed") return pathname === "/feed";
    return pathname.startsWith(href);
  }

  return (
    <nav className="section-card p-2">
      <ul className="space-y-1">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className={`flex items-center gap-3 rounded px-3 py-2 transition-colors hover:bg-neutral-100 dark:hover:bg-white/10 ${
                isActive(l.href) ? "bg-neutral-100 dark:bg-white/10 font-semibold" : ""
              }`}
            >
              <Icon name={l.icon} />
              <span className="font-medium hidden xl:inline">{l.label}</span>
            </Link>
          </li>
        ))}

        {me ? (
          <li>
            <Link
              href={`/profile/${me.id}`}
              className={`flex items-center gap-3 rounded px-3 py-2 transition-colors hover:bg-neutral-100 dark:hover:bg-white/10 ${
                pathname?.startsWith("/profile") ? "bg-neutral-100 dark:bg-white/10 font-semibold" : ""
              }`}
            >
              <Icon name="profile" />
              <span className="font-medium hidden xl:inline">Profile</span>
            </Link>
          </li>
        ) : null}

        <li>
          <Link href="/more" className={`flex items-center gap-3 rounded px-3 py-2 transition-colors hover:bg-neutral-100 dark:hover:bg-white/10 ${isActive("/more")?"bg-neutral-100 dark:bg-white/10 font-semibold":""}`}>
            <Icon name="more" />
            <span className="font-medium hidden xl:inline">More</span>
          </Link>
        </li>
      </ul>
      <div className="p-3">
        <Link href="/post/new" className="btn btn-primary w-full">Post</Link>
      </div>
    </nav>
  );
}
