function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-white/10 ${className}`} />;
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="surface overflow-hidden">
      <div className="divide-y divide-white/10">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="grid gap-4 px-6 py-4 sm:grid-cols-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-full sm:col-span-2" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Skeleton;