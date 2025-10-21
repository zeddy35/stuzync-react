export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import AutoImageUpload from "@/components/AutoImageUpload";
import SettingsProfileForm from "@/components/SettingsProfileForm";

export default async function SettingsProfilePage({
  searchParams,
}: {
  searchParams?: { updated?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  await dbConnect();
  const user = await User.findById((session as any).user.id)
    .select("firstName lastName school phone profilePic profileBanner bio skills interests")
    .lean();

  const updated = searchParams?.updated === "1";

  return (
    <div className="page-wrap py-8">
      <h1 className="text-2xl font-semibold mb-4">Profile Settings</h1>

      {updated && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
          Saved
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Client-side save with toasts */}
        <SettingsProfileForm
          defaults={{
            firstName: (user as any)?.firstName,
            lastName: (user as any)?.lastName,
            school: (user as any)?.school,
            phone: (user as any)?.phone,
            bio: (user as any)?.bio,
            skills: (user as any)?.skills,
            interests: (user as any)?.interests,
          }}
        />

        {/* Images - auto upload */}
        <div className="space-y-6">
          <AutoImageUpload
            label="Banner"
            action="/api/upload/banner"
            initialUrl={(user as any)?.profileBanner}
          />
          <AutoImageUpload
            label="Avatar"
            action="/api/upload/avatar"
            initialUrl={(user as any)?.profilePic}
          />
        </div>
      </div>
    </div>
  );
}

