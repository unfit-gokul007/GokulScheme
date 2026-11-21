export function SchemeSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading schemes">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div className="h-3 w-48 rounded bg-slate-200" />
          <div className="mt-3 h-6 w-3/4 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-full rounded bg-slate-100" />
          <div className="mt-2 h-4 w-5/6 rounded bg-slate-100" />
          <div className="mt-5 flex justify-between">
            <div className="h-4 w-36 rounded bg-slate-200" />
            <div className="h-10 w-36 rounded-xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
