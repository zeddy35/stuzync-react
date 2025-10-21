import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serverJson } from "@/lib/api";
import PostComposer from "@/components/PostComposer";
import FeedList from "@/components/FeedList";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null; // middleware already guards

  let posts: any[] = [];
  try {
    const data = await serverJson<{ posts: any[] }>("/api/feed");
    posts = data.posts ?? [];
  } catch {
    // keep empty -> show skeleton
  }

  return (
    <div className="space-y-4 py-4">
      <PostComposer />
      <FeedList initialPosts={posts as any} />
    </div>
  );
}

// skeleton moved into FeedList
