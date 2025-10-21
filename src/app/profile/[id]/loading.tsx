import { SkeletonCard } from "@/components/Skeletons";

export default function ProfileLoading() {
  return (
    <div className="page-wrap py-6 space-y-4">
      <SkeletonCard lines={3} />
      <SkeletonCard lines={6} />
      <SkeletonCard lines={4} />
    </div>
  );
}

