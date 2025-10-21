"use client";

export function SkeletonLine({ w = "100%", h = 12, rounded = true }: { w?: string; h?: number; rounded?: boolean }) {
  return <div className={`bg-neutral-200/70 dark:bg-white/10 ${rounded ? 'rounded' : ''}`} style={{ width: w, height: h }} />;
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="section-card animate-pulse space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} w={`${90 - i * 8}%`} />
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="section-card animate-pulse p-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-neutral-200/70 dark:bg-white/10" />
        <div className="flex-1 space-y-2">
          <SkeletonLine w="60%" />
          <SkeletonLine w="40%" h={10} />
        </div>
      </div>
      <SkeletonCard lines={4} />
      <SkeletonCard lines={3} />
    </div>
  );
}

export function TrendsSkeleton() {
  return (
    <div className="section-card animate-pulse p-4 space-y-2">
      <SkeletonLine w="40%" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <SkeletonLine w="60%" />
          <SkeletonLine w="15%" />
        </div>
      ))}
    </div>
  );
}

export function FeedSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="section-card animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-neutral-200/70 dark:bg-white/10" />
            <div className="flex-1">
              <SkeletonLine w="30%" />
              <SkeletonLine w="20%" h={10} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <SkeletonLine />
            <SkeletonLine w="90%" />
            <SkeletonLine w="80%" />
          </div>
        </div>
      ))}
    </div>
  );
}

