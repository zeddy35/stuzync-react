import { SkeletonCard } from "@/components/Skeletons";

export default function ZyncLoading() {
  return (
    <div className="page-wrap py-8 space-y-4">
      <SkeletonCard lines={2} />
      <SkeletonCard lines={5} />
      <SkeletonCard lines={5} />
    </div>
  );
}

