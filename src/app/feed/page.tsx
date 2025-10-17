import { dbConnect } from "@/lib/db";
import Post from "@/models/Post";

export default async function FeedPage() {
  await dbConnect();
  const posts = await Post.find({ isFlagged: false })
    .populate("author", "name profilePic")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Feed</h1>
      <div className="space-y-4">
        {posts.map((p: any) => (
          <article key={p._id} className="rounded-xl border border-white/10 p-4">
            <div className="text-sm opacity-70">{p.author?.name}</div>
            {p.content && <p className="mt-1">{p.content}</p>}
            {p.fileUrl && <a className="text-sky-400 underline" href={p.fileUrl} target="_blank">Attachment</a>}
          </article>
        ))}
      </div>
    </main>
  );
}
