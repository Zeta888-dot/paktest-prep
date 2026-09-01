import { AlertCircle, RotateCcw } from "lucide-react"

export function ErrorState({
  title = "Something went wrong",
  desc = "We couldn't load this data. Please try again.",
  onRetry,
}: {
  title?: string
  desc?: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center animate-fade-up">
      <div className="rounded-full bg-red-500/10 p-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="mt-4 font-medium text-card-foreground">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{desc}</p>
      <div className="mt-5">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
        >
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
      </div>
    </div>
  )
}
