"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, HelpCircle, Target, History, ArrowRight, BookOpen } from "lucide-react"
import { loadSettings } from "@/lib/settings"

type HistoryRow = {
  id: string
  testName: string
  source: string
  correct: number
  total: number
  createdAt: string
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ]
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`
  }
  return "Just now"
}

function accuracyColor(pct: number) {
  if (pct >= 80) return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
  if (pct >= 50) return "bg-amber-400/10 text-amber-400 border-amber-400/20"
  return "bg-red-400/10 text-red-400 border-red-400/20"
}

export default function DashboardPage() {
  const router = useRouter()
  const [rows, setRows] = useState<HistoryRow[]>([])
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setName(loadSettings().displayName)
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => {
        setRows(d.history ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const attempts = rows.length
  const answered = rows.reduce((a, r) => a + r.total, 0)
  const accuracy = answered
    ? Math.round((rows.reduce((a, r) => a + r.correct, 0) / answered) * 100)
    : 0

  const stats = [
    { icon: BarChart3, label: "Attempts", value: attempts, color: "bg-blue-400/10 text-blue-400" },
    { icon: HelpCircle, label: "Questions", value: answered, color: "bg-purple-400/10 text-purple-400" },
    { icon: Target, label: "Accuracy", value: `${accuracy}%`, color: "bg-emerald-400/10 text-emerald-400" },
  ]

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back{name ? `, ${name}` : ""}
        </h1>
        <p className="mt-2 text-muted-foreground">Select a test to start practicing.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-border/80 hover:shadow-lg hover:shadow-black/20"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={`rounded-lg p-1.5 transition group-hover:scale-110 ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </span>
              {s.label}
            </div>
            <div className="mt-3 text-3xl font-semibold text-card-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/tests")}
        className="group flex w-full items-center justify-between rounded-xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-border/80 hover:shadow-lg hover:shadow-black/20 sm:w-auto sm:inline-flex sm:gap-4"
      >
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-primary/10 p-2 text-primary">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <div className="font-medium text-card-foreground">Start Practicing</div>
            <div className="text-sm text-muted-foreground">Pick a test and generate MCQs</div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
      </button>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium text-foreground">Recent Attempts</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-12 text-center">
            <History className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">No attempts yet. Take your first test!</p>
            <button
              onClick={() => router.push("/tests")}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Browse Tests <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {rows.slice(0, 5).map((r) => {
              const pct = Math.round((r.correct / r.total) * 100)
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3 text-sm transition hover:bg-accent"
                >
                  <div className="min-w-0">
                    <span className="block truncate font-medium text-card-foreground">{r.testName}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.source === "material" ? "From Material" : "From Syllabus"} · {timeAgo(r.createdAt)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-muted-foreground">
                    <span>
                      {r.correct}/{r.total}
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${accuracyColor(pct)}`}>
                      {pct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}