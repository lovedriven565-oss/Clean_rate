export function RatingSkeleton({ viewMode = "list" }: { viewMode?: "list" | "grid" }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-border bg-card p-5"
          >
            <div className="mb-4 h-40 rounded-xl bg-muted" />
            <div className="mb-2 h-5 w-3/4 rounded bg-muted" />
            <div className="mb-4 h-4 w-1/2 rounded bg-muted" />
            <div className="mb-2 h-4 w-full rounded bg-muted" />
            <div className="mb-4 h-4 w-2/3 rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-9 flex-1 rounded-full bg-muted" />
              <div className="h-9 flex-1 rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex items-center gap-3 sm:flex-col">
              <div className="h-7 w-7 rounded-lg bg-muted" />
              <div className="h-12 w-12 rounded-2xl bg-muted" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/3 rounded bg-muted" />
              <div className="h-4 w-1/4 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
            <div className="flex flex-col gap-2 sm:w-32">
              <div className="h-9 rounded-full bg-muted" />
              <div className="h-9 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
