import { apiGet } from '@/lib/api';
import PostComposer from '@/components/PostComposer';
import PostCard from '@/components/PostCard';
import RightSidebar from '@/components/RightSidebar';
import LeftSidebar from '@/components/LeftSidebar';

export const dynamic = 'force-dynamic';

async function getFeed(tag?: string) {
  const qs = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  const [postsRes, tagsRes, meRes] = await Promise.all([
    apiGet(`/api/feed${qs}`),           // küçük bir JSON ucu ekliyoruz (aşağıda)
    apiGet(`/api/popular-tags`),
    apiGet(`/api/me`),
  ]);
  return {
    posts: await postsRes.json(),
    popularTags: await tagsRes.json(),
    me: await meRes.json(),
  };
}

export default async function Feed({ searchParams }: { searchParams: { tag?: string } }) {
  const { posts, popularTags, me } = await getFeed(searchParams?.tag);

  return (
    <main className="mx-auto max-w-[1280px] px-4 mt-6 grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)_300px] gap-6">
      <aside className="hidden md:block"><LeftSidebar /></aside>

      <section className="space-y-6">
        <PostComposer me={me} />
        {posts?.length ? posts.map((p: any) => (
          <PostCard key={p._id} post={p} me={me}/>
        )) : (
          <p className="text-center text-sm text-neutral-500">Gösterilecek gönderi yok.</p>
        )}
      </section>

      <aside className="hidden md:block">
        <RightSidebar popularTags={popularTags} />
      </aside>
    </main>
  );
}
