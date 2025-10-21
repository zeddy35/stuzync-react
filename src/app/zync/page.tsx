import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import ZyncRequests from "@/components/ZyncRequests";
import SuggestedUsers from "@/components/SuggestedUsers";

export const dynamic = "force-dynamic";

export default async function ZyncPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  await dbConnect();
  const me = await User.findById((session as any).user.id)
    .select("friendRequestsReceived friendRequestsSent")
    .populate({ path: "friendRequestsReceived", select: "firstName lastName profilePic" })
    .populate({ path: "friendRequestsSent", select: "firstName lastName profilePic" })
    .lean();

  const received = ((me as any)?.friendRequestsReceived || []).map((u: any) => ({ _id: String(u._id), firstName: u.firstName, lastName: u.lastName, profilePic: u.profilePic }));
  const sent = ((me as any)?.friendRequestsSent || []).map((u: any) => ({ _id: String(u._id), firstName: u.firstName, lastName: u.lastName, profilePic: u.profilePic }));

  return (
    <div className="page-wrap py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Zync</h1>
      {/* Requests */}
      {/* @ts-expect-error Server/Client mixing */}
      <ZyncRequests received={received} sent={sent} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">People you may know</h2>
        {/* Suggestions */}
        {/* @ts-expect-error Server Component */}
        <SuggestedUsers />
      </section>
    </div>
  );
}

