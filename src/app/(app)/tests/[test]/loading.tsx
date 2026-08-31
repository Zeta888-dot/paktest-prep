"use client"

export default function TestDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-pulse pb-10">
      {/* Back button + title */}
      <div className="space-y-4">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-32 rounded-lg bg-muted" />
            <div className="h-4 w-96 rounded bg-muted" />
          </div>
          <div className="h-14 w-24 rounded-xl bg-muted" />
        </div>
      </div>

      {/* Mode cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-lg bg-muted" />
              <div className="h-5 w-5 rounded-full bg-muted" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Focus areas + settings skeleton */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-5 w-24 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted" />
            </div>
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
          <div className="mt-5 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <div className="space-y-1">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-20 rounded bg-muted" />
                </div>
                <div className="h-6 w-14 rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </div>

        <div className="h-fit rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="space-y-1">
            <div className="h-5 w-28 rounded bg-muted" />
            <div className="h-3 w-40 rounded bg-muted" />
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <div className="mb-2 flex justify-between">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-3 w-12 rounded bg-muted" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-xl bg-muted" />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-3 w-8 rounded bg-muted" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 rounded-xl bg-muted" />
                ))}
              </div>
            </div>
            <div className="h-20 rounded-xl bg-muted" />
            <div className="h-11 w-full rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    </div>
  )
}