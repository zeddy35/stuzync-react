import { SkeletonCard } from "@/components/Skeletons";

export default function SettingsProfileLoading() {
  return (
    <div className="page-wrap py-8 space-y-4">
      <SkeletonCard lines={2} />
      <SkeletonCard lines={6} />
      <SkeletonCard lines={3} />
    </div>
  );
}

