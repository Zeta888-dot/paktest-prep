import type { LucideIcon } from "lucide-react"

export function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
}: {
  icon: LucideIcon
  title: string
  desc: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center animate-fade-up">
      <div className="rounded-full bg-primary/10 p-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mt-4 font-medium text-card-foreground">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}