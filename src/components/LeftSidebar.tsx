import AdSlot from "./AdSlot";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LeftNav from "@/components/LeftNav";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default async function LeftSidebar() {
  const session = await getServerSession(authOptions);
  const me = (session as any)?.user;
  return (
    <div className="sticky top-14 space-y-4">
      {/* Profile summary */}
      <div className="section-card p-3">
        {me ? (
          <a href={`/profile/${me.id}`} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={me.image || "/images/avatar-fallback.svg"} alt="" className="h-10 w-10 rounded-full object-cover" width="40" height="40" />
            <div>
              <div className="font-semibold text-sm">{(me as any).name || "Profile"}</div>
              <div className="text-xs text-neutral-500">View your profile</div>
            </div>
          </a>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <a href="/login" className="btn btn-secondary btn-sm">Login</a>
            <a href="/register" className="btn btn-primary btn-sm">Sign up</a>
          </div>
        )}
      </div>

      {/* Client nav with active highlights */}
      {/* @ts-expect-error Client Component */}
      <LeftNav me={me ? { id: String(me.id), name: (me as any).name, image: (me as any).image } : null} />

      <div className="section-card p-3">
        <h3 className="font-semibold mb-2">Sponsored</h3>
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEFT} />
      </div>

      {/* Appearance settings */}
      {/* @ts-expect-error Client Component */}
      <ThemeSwitcher />
    </div>
  );
}
