"use client"

export default function TestsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-muted" />
          <div className="h-4 w-64 rounded bg-muted" />
        </div>
        <div className="h-6 w-16 rounded-full bg-muted" />
      </div>

      {/* Featured test skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-muted" />
            <div className="space-y-2">
              <div className="h-5 w-56 rounded bg-muted" />
              <div className="flex gap-2">
                <div className="h-5 w-20 rounded-md bg-muted" />
                <div className="h-5 w-24 rounded-md bg-muted" />
                <div className="h-5 w-28 rounded-md bg-muted" />
              </div>
            </div>
          </div>
          <div className="h-9 w-24 rounded-full bg-muted" />
        </div>
      </div>

      {/* Search + filters skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-10 w-full rounded-lg bg-muted sm:max-w-xs" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-muted" />
          ))}
        </div>
      </div>

      {/* Test cards grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-muted" />
              <div className="h-10 w-10 rounded-full bg-muted" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
            <div className="mt-4 flex gap-2">
              <div className="h-5 w-16 rounded-md bg-muted" />
              <div className="h-5 w-20 rounded-md bg-muted" />
            </div>
            <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="ml-auto h-3 w-16 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}