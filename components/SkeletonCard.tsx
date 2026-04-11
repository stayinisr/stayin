export default function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-[var(--border-soft)] bg-white p-5 animate-pulse">
      <div className="h-4 w-24 rounded bg-gray-200 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded bg-gray-200 mb-3 ${
            i === lines - 1 ? "w-1/2" : "w-full"
          }`}
        />
      ))}
    </div>
  );
}