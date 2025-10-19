// src/app/settings/profile/page.tsx
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export default async function SettingsProfilePage() {
  const session = await getServerSession(authOptions);
  await dbConnect();
  const user = session?.user
    ? await User.findById((session as any).user.id).select("firstName lastName school phone").lean()
    : null;

  return (
    <div className="page-wrap py-8">
      <h1 className="text-2xl font-semibold mb-4">Profile Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <form action="/api/profile" method="POST" className="section-card space-y-4">
          <div>
            <label className="label" htmlFor="firstName">First name</label>
            <input className="input" id="firstName" name="firstName" defaultValue={(user as any)?.firstName || ""} required />
          </div>
          <div>
            <label className="label" htmlFor="lastName">Last name</label>
            <input className="input" id="lastName" name="lastName" defaultValue={(user as any)?.lastName || ""} required />
          </div>
          <div>
            <label className="label" htmlFor="school">School</label>
            <input className="input" id="school" name="school" defaultValue={(user as any)?.school || ""} />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone</label>
            <input className="input" id="phone" name="phone" defaultValue={(user as any)?.phone || ""} />
          </div>
          <button className="btn btn-primary" type="submit">Save</button>
        </form>

        <div className="space-y-6">
          {/* Avatar Upload */}
          <form action="/api/upload/avatar" method="POST" encType="multipart/form-data" className="section-card space-y-3">
            <div>
              <label className="label" htmlFor="avatar">Avatar</label>
              <input type="file" id="avatar" name="file" accept="image/*" className="text-sm" />
            </div>
            <button className="btn btn-ghost" type="submit">Upload avatar</button>
          </form>

          {/* Banner Upload */}
          <form action="/api/upload/banner" method="POST" encType="multipart/form-data" className="section-card space-y-3">
            <div>
              <label className="label" htmlFor="banner">Banner</label>
              <input type="file" id="banner" name="file" accept="image/*" className="text-sm" />
            </div>
            <button className="btn btn-ghost" type="submit">Upload banner</button>
          </form>
        </div>
      </div>
    </div>
  );
}
