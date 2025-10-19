// src/app/profile/[id]/page.tsx
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: { id: string } };

// (isteğe bağlı) bu route’u SSR tutuyoruz:
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await dbConnect();
  const user = await User.findById(params.id).select("name").lean();
  return { title: user?.name ? `${user.name} • StuZync` : "Profile • StuZync" };
}

export default async function ProfilePage({ params }: Props) {
  await dbConnect();

  const user = await User.findById(params.id)
    .select("name username bio profilePic profileBanner school headline skills interests badges")
    .populate("badges", "name icon")
    .lean();

  if (!user) {
    // 404 sayfasına gönder
    notFound();
  }

  return (
    <div className="page-wrap py-6">
      <div className="section-card p-0 overflow-hidden">
        {/* Banner */}
        {user.profileBanner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.profileBanner} alt="banner" className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-24 bg-gradient-to-r from-zync-500/20 to-emerald-400/20" />
        )}

        {/* Header */}
        <div className="p-5 -mt-10">
          <div className="flex items-end gap-4">
            <div className="h-20 w-20 rounded-xl overflow-hidden border border-white/20 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.profilePic || "/images/avatar-fallback.png"}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-semibold">{user.name}</h1>
              <p className="text-sm text-neutral-500">
                @{user.username || "nousername"} {user.school ? `· ${user.school}` : ""}
              </p>
              {user.headline && (
                <p className="mt-1 text-neutral-700 dark:text-neutral-200">{user.headline}</p>
              )}
            </div>

            <a className="btn btn-ghost" href="/settings/profile">
              Edit profile
            </a>
          </div>

          {/* Body */}
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="section-title">About</h2>
              <div className="section-card">
                {user.bio ? (
                  <p className="whitespace-pre-wrap">{user.bio}</p>
                ) : (
                  <p className="muted">No bio yet.</p>
                )}
              </div>

              <h2 className="section-title mt-6">Badges</h2>
              <div className="section-card flex flex-wrap gap-2">
                {Array.isArray(user.badges) && user.badges.length ? (
                  (user.badges as any[]).map((b) => (
                    <span key={String(b._id)} className="chip">
                      {b.name}
                    </span>
                  ))
                ) : (
                  <p className="muted">No badges yet.</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="section-title">Skills & Interests</h2>
              <div className="section-card flex flex-wrap gap-2">
                {user.skills?.map((s: string) => (
                  <span key={`skill-${s}`} className="chip">
                    {s}
                  </span>
                ))}
                {user.interests?.map((s: string) => (
                  <span key={`interest-${s}`} className="chip">
                    {s}
                  </span>
                ))}
                {!user.skills?.length && !user.interests?.length && <p className="muted">—</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TODO: Kullanıcının post’ları / favorites */}
    </div>
  );
}
