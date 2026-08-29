"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  HelpCircle,
  Target,
  History,
  ArrowRight,
  BookOpen,
  Activity,
  Flame,
  AlertTriangle,
  Clock,
  Zap,
  FolderOpen,
  PenLine,
  Timer,
} from "lucide-react"
import { loadSettings } from "@/lib/settings"
import { EmptyState } from "@/components/ui/empty-state"

type HistoryRow = {
  id: string
  testName: string
  source: string
  correct: number
  total: number
  duration: number | null
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

function formatDuration(seconds: number) {
  if (!seconds) return "0m"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  if (mins < 60) return `${mins}m ${secs}s`
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  return `${hours}h ${remMins}m`
}

function accuracyColor(pct: number) {
  if (pct >= 80) return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
  if (pct >= 50) return "bg-amber-400/10 text-amber-400 border-amber-400/20"
  return "bg-red-400/10 text-red-400 border-red-400/20"
}

function barColor(pct: number) {
  if (pct >= 80) return "bg-emerald-400"
  if (pct >= 50) return "bg-amber-400"
  return "bg-red-400"
}

function calcStreak(rows: HistoryRow[]) {
  const days = new Set(rows.map((r) => new Date(r.createdAt).toDateString()))
  let streak = 0
  const d = new Date()
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1)
  while (days.has(d.toDateString())) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

function summarize(rows: HistoryRow[]) {
  const byTest: Record<string, { correct: number; total: number; attempts: number }> = {}
  for (const r of rows) {
    if (!byTest[r.testName]) byTest[r.testName] = { correct: 0, total: 0, attempts: 0 }
    byTest[r.testName].correct += r.correct
    byTest[r.testName].total += r.total
    byTest[r.testName].attempts += 1
  }
  return Object.entries(byTest)
    .map(([name, v]) => ({
      name,
      attempts: v.attempts,
      pct: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.attempts - a.attempts)
}

function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start: number | null = null
    let raf: number
    function step(ts: number) {
      if (start === null) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  fmt,
}: {
  icon: any
  label: string
  value: number
  color: string
  fmt?: (n: number) => string
}) {
  const n = useCountUp(value)
  const display = fmt ? fmt(n) : `${n}`
  return (
    <div className="group rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-border/80 hover:shadow-lg hover:shadow-black/20">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={`rounded-lg p-1.5 transition group-hover:scale-110 ${color}`}>
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold text-card-foreground">{display}</div>
    </div>
  )
}

function GoalRing({ done, goal }: { done: number; goal: number }) {
  const [p, setP] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setP(Math.min(done / goal, 1)), 150)
    return () => clearTimeout(t)
  }, [done, goal])
  const r = 42
  const c = 2 * Math.PI * r
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="10" stroke="currentColor" className="text-muted" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke="currentColor"
          className="text-emerald-400 transition-all duration-1000 ease-out"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-foreground">{done}</span>
        <span className="text-[10px] text-muted-foreground">of {goal}</span>
      </div>
    </div>
  )
}

function sourceIcon(source: string) {
  if (source === "material") return FolderOpen
  if (source === "subjective") return PenLine
  if (source === "mock") return Timer
  return BookOpen
}

const DAILY_GOAL = 20
const XP_PER_LEVEL = 250

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
  const correctTotal = rows.reduce((a, r) => a + r.correct, 0)
  const accuracy = answered ? Math.round((correctTotal / answered) * 100) : 0
  const streak = calcStreak(rows)
  const totalDuration = rows.reduce((a, r) => a + (r.duration ?? 0), 0)
  const breakdown = summarize(rows)
  const weak = breakdown.filter((t) => t.pct < 50).sort((a, b) => a.pct - b.pct)

  const xp = correctTotal * 10
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const intoLevel = xp % XP_PER_LEVEL

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toDateString()
    const dayRows = rows.filter((r) => new Date(r.createdAt).toDateString() === key)
    return {
      label: d.toLocaleDateString("en-US", { weekday: "narrow" }),
      qs: dayRows.reduce((a, r) => a + r.total, 0),
      attempts: dayRows.length,
      isToday: i === 6,
    }
  })
  const maxQs = Math.max(...week.map((w) => w.qs), 1)
  const todayQs = week[6].qs

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back{name ? `, ${name}` : ""}
        </h1>
        <p className="mt-2 text-muted-foreground">Select a test to start practicing.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-lg bg-yellow-400/10 p-1.5 text-yellow-400">
                <Zap className="h-4 w-4" />
              </span>
              Level {level}
            </div>
            <span className="text-xs font-medium text-yellow-400">{xp} XP</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-yellow-400 transition-all duration-1000"
              style={{ width: `${Math.max((intoLevel / XP_PER_LEVEL) * 100, 2)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {XP_PER_LEVEL - intoLevel} XP to Level {level + 1}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-lg bg-emerald-400/10 p-1.5 text-emerald-400">
                <Target className="h-4 w-4" />
              </span>
              Daily Goal
            </div>
            <p className="mt-3 text-sm font-medium text-card-foreground">
              {todayQs >= DAILY_GOAL ? "Goal complete! Welldone!" : `${DAILY_GOAL - todayQs} questions to go`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Answer {DAILY_GOAL} questions a day</p>
          </div>
          <GoalRing done={todayQs} goal={DAILY_GOAL} />
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-lg bg-cyan-400/10 p-1.5 text-cyan-400">
              <Activity className="h-4 w-4" />
            </span>
            This Week
          </div>
          <div className="mt-4 flex h-20 items-end gap-1.5">
            {week.map((w, i) => (
              <div
                key={i}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                title={`${w.qs} questions, ${w.attempts} attempts`}
              >
                <div
                  className={`w-full rounded-t-md transition-all duration-700 ${
                    w.qs === 0 ? "bg-muted" : w.isToday ? "bg-cyan-400" : "bg-cyan-400/50"
                  }`}
                  style={{ height: `${Math.max((w.qs / maxQs) * 100, 4)}%` }}
                />
                <span className={`text-[10px] ${w.isToday ? "font-bold text-cyan-400" : "text-muted-foreground"}`}>
                  {w.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={BarChart3} label="Attempts" value={attempts} color="bg-blue-400/10 text-blue-400" />
        <StatCard icon={HelpCircle} label="Questions" value={answered} color="bg-purple-400/10 text-purple-400" />
        <StatCard icon={Clock} label="Study Time" value={totalDuration} color="bg-cyan-400/10 text-cyan-400" fmt={formatDuration} />
        <StatCard icon={Target} label="Accuracy" value={accuracy} color="bg-emerald-400/10 text-emerald-400" fmt={(n) => `${n}%`} />
        <StatCard icon={Flame} label="Day Streak" value={streak} color="bg-orange-400/10 text-orange-400" />
      </div>

      {weak.length > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-400/20 bg-gradient-to-r from-amber-400/10 to-transparent p-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-amber-400/10 p-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-medium text-foreground">Focus today: {weak[0].name}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Accuracy {weak[0].pct}%. Just 10 minutes of practice can change that.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/tests/${encodeURIComponent(weak[0].name)}`)}
            className="shrink-0 rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold text-black transition hover:bg-amber-300 active:scale-95"
          >
            Practice Now
          </button>
        </div>
      )}

      {breakdown.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium text-foreground">Test Breakdown</h2>
          </div>
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            {breakdown.map((t) => (
              <div key={t.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-card-foreground">{t.name}</span>
                  <span className="text-muted-foreground">
                    {t.pct}% · {t.attempts} attempt{t.attempts > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${barColor(t.pct)}`}
                    style={{ width: `${Math.max(t.pct, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {weak.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h2 className="font-medium text-foreground">Needs Improvement</h2>
            <span className="text-xs text-muted-foreground">(below 50% accuracy)</span>
          </div>
          <div className="space-y-2">
            {weak.map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/5 px-5 py-3 text-sm"
              >
                <div className="min-w-0">
                  <span className="block truncate font-medium text-card-foreground">{t.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {t.attempts} attempt{t.attempts > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
                    {t.pct}%
                  </span>
                  <button
                    onClick={() => router.push(`/tests/${encodeURIComponent(t.name)}`)}
                    className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:opacity-90"
                  >
                    Practice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
          <EmptyState
            icon={History}
            title="No attempts yet"
            desc="Take your first test and start building your streak."
            action={
              <button
                onClick={() => router.push("/tests")}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Browse Tests <ArrowRight className="h-4 w-4" />
              </button>
            }
          />
        ) : (
          <div className="space-y-2">
            {rows.slice(0, 5).map((r) => {
              const pct = Math.round((r.correct / r.total) * 100)
              const SIcon = sourceIcon(r.source)
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3 text-sm transition hover:bg-accent"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 rounded-lg bg-muted p-2 text-muted-foreground">
                      <SIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="block truncate font-medium text-card-foreground">{r.testName}</span>
                      <span className="text-xs text-muted-foreground">
                        {r.source === "material" ? "From Material" : r.source === "subjective" ? "Part B (Subjective)" : r.source === "mock" ? "Mock Test" : "From Syllabus"} · {timeAgo(r.createdAt)}
                        {r.duration ? ` · ${formatDuration(r.duration)}` : ""}
                      </span>
                    </div>
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