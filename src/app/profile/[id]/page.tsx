import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
// Türkçe: Badge modeli yalnızca populate sırasında gerekli, ağaç sarsıcı tarafından
// temizlenmemesi için yan etki importu kullanıyoruz.
import "@/models/Badge";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FollowButton from "@/components/FollowButton";
import ProfilePostsList from "@/components/ProfilePostsList";
import type { Metadata } from "next";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await dbConnect();
  const u = await User.findById(params.id).select("firstName lastName").lean();
  const full = u ? `${u.firstName} ${u.lastName}`.trim() : null;
  return { title: full ? `${full} · StuZync` : "Profile · StuZync" };
}

export default async function ProfilePage({ params }: Props) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  const u = await User.findById(params.id)
    .select("firstName lastName email bio profilePic profileBanner school skills interests badges followers following")
    .populate("badges", "name icon")
    .lean();

  if (!u) {
    return (
      <div className="page-wrap py-10">
        <div className="section-card">Profile not found.</div>
      </div>
    );
  }

  const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
  const posts = await Post.find({ author: (u as any)._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("content createdAt")
    .lean();
  const isOwn = !!(session && (session as any).user?.id && String((session as any).user.id) === String((u as any)._id));
  let isFollowing = false;
  if (!isOwn && session?.user) {
    const me = await User.findById((session as any).user.id).select("following").lean();
    isFollowing = !!(me && Array.isArray((me as any).following) && (me as any).following.some((fid: any) => String(fid) === String((u as any)._id)));
  }

  return (
    <div className="page-wrap py-6">
      <div className="section-card p-0 overflow-hidden">
        {u.profileBanner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={u.profileBanner} alt="banner" className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-24 bg-gradient-to-r from-emerald-400/20 to-emerald-500/10" />
        )}

        <div className="p-5 -mt-10">
          <div className="flex items-end gap-4">
            <div className="h-20 w-20 rounded-xl overflow-hidden border border-white/20 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u.profilePic || "/images/avatar-fallback.svg"}
                alt={fullName || "User"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">{fullName || "User"}</h1>
              <p className="text-sm text-neutral-500">{u.school ? u.school : ""}</p>
              <div className="text-xs text-neutral-500 mt-1">
                <span className="font-medium">{Array.isArray((u as any).followers) ? (u as any).followers.length : 0}</span> followers ·
                <span className="font-medium"> {Array.isArray((u as any).following) ? (u as any).following.length : 0}</span> following
              </div>
            </div>
            {isOwn ? (
              <a className="btn btn-ghost" href="/settings/profile">Edit profile</a>
            ) : (
              <FollowButton userId={String((u as any)._id)} initialFollowing={isFollowing} />
            )}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="section-title">About</h2>
                <div className="section-card">
                  {u.bio ? <p className="whitespace-pre-wrap">{u.bio}</p> : <p className="muted">No bio yet.</p>}
                </div>
              </div>

              <div>
                <h2 className="section-title">Recent Posts</h2>
                <ProfilePostsList userId={String((u as any)._id)} initial={posts as any} />
              </div>

              <div>
                <h2 className="section-title">Badges</h2>
                <div className="section-card flex flex-wrap gap-2">
                  {Array.isArray(u.badges) && (u.badges as any[]).length > 0 ? (
                    (u.badges as any[]).map((b: any) => (
                      <span key={String(b._id)} className="chip inline-flex items-center gap-1">
                        {b.icon ? <img src={b.icon} alt="" className="w-4 h-4" /> : null}
                        {b.name}
                      </span>
                    ))
                  ) : (
                    <p className="muted">No badges yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="section-title">Skills & Interests</h2>
                <div className="section-card flex flex-wrap gap-2">
                  {u.skills?.map((s: string) => <span key={`skill-${s}`} className="chip">{s}</span>)}
                  {u.interests?.map((i: string) => <span key={`interest-${i}`} className="chip">{i}</span>)}
                  {!u.skills?.length && !u.interests?.length && <p className="muted">—</p>}
                </div>
              </div>

              <div>
                <h2 className="section-title">Contact</h2>
                <div className="section-card text-sm">
                  <div className="muted">Email</div>
                  <div>{u.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
