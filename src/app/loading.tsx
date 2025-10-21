import Spinner from "@/components/Spinner";

export default function GlobalLoading() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="flex items-center gap-3 text-neutral-500">
        <Spinner size={28} />
        <span>Loading…</span>
      </div>
    </div>
  );
}

