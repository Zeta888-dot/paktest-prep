"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Shield,
  FileText,
  Keyboard,
  Plane,
  HeartPulse,
  Cog,
  GraduationCap,
  BookOpen,
  School,
  BadgeCheck,
  Landmark,
  ArrowUpRight,
  SearchX,
  Flame,
  Sparkles,
  Clock,
  Zap,
  TrendingUp,
  ChevronRight,
  Play,
  RotateCcw,
  BarChart3,
  Star,
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { getSyllabus } from "@/lib/syllabus"

const tests = [
  { name: "Police Constable (KPK / Islamabad)", icon: Shield, color: "bg-blue-400/10 text-blue-400", category: "Defense & Police", difficulty: "Medium", estQs: 100 },
  { name: "Junior / Senior Clerk", icon: FileText, color: "bg-amber-400/10 text-amber-400", category: "Clerical & Admin", difficulty: "Easy", estQs: 75 },
  { name: "Stenotypist", icon: Keyboard, color: "bg-pink-400/10 text-pink-400", category: "Clerical & Admin", difficulty: "Medium", estQs: 80 },
  { name: "ASF", icon: Shield, color: "bg-cyan-400/10 text-cyan-400", category: "Defense & Police", difficulty: "Hard", estQs: 120 },
  { name: "Air Force Commission Posts", icon: Plane, color: "bg-sky-400/10 text-sky-400", category: "Defense & Police", difficulty: "Hard", estQs: 150 },
  { name: "MDCAT", icon: HeartPulse, color: "bg-red-400/10 text-red-400", category: "Medical & Engineering", difficulty: "Hard", estQs: 200 },
  { name: "ECAT", icon: Cog, color: "bg-orange-400/10 text-orange-400", category: "Medical & Engineering", difficulty: "Medium", estQs: 150 },
  { name: "SST (Senior Subject Specialist)", icon: GraduationCap, color: "bg-purple-400/10 text-purple-400", category: "Teaching", difficulty: "Medium", estQs: 100 },
  { name: "CT (Certified Teacher)", icon: BookOpen, color: "bg-emerald-400/10 text-emerald-400", category: "Teaching", difficulty: "Easy", estQs: 80 },
  { name: "PST (Primary School Teacher)", icon: School, color: "bg-teal-400/10 text-teal-400", category: "Teaching", difficulty: "Easy", estQs: 75 },
  { name: "PASI (Assistant Sub Inspector)", icon: BadgeCheck, color: "bg-indigo-400/10 text-indigo-400", category: "Defense & Police", difficulty: "Hard", estQs: 120 },
  { name: "CSS & PMS", icon: Landmark, color: "bg-yellow-400/10 text-yellow-400", category: "Civil Services", difficulty: "Hard", estQs: 300 },
]

const categories = ["All", "Defense & Police", "Clerical & Admin", "Teaching", "Medical & Engineering", "Civil Services"]

function difficultyColor(d: string) {
  if (d === "Easy") return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
  if (d === "Medium") return "bg-amber-400/10 text-amber-400 border-amber-400/20"
  return "bg-red-400/10 text-red-400 border-red-400/20"
}

function CircularProgress({ pct, size = 44 }: { pct: number; size?: number }) {
  const r = (size - 4) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - pct / 100)
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="3" stroke="currentColor" className="text-muted" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" strokeWidth="3" strokeLinecap="round" stroke="currentColor"
          className="text-indigo-400 transition-all duration-700"
          strokeDasharray={c} strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
        {pct}%
      </span>
    </div>
  )
}

export default function TestsPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [attempts, setAttempts] = useState<Record<string, number>>({})
  const [progress, setProgress] = useState<Record<string, number>>({})
  const [lastAttempted, setLastAttempted] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => {
        const counts: Record<string, number> = {}
        const prog: Record<string, { correct: number; total: number }> = {}
        const last: Record<string, string> = {}
        for (const row of d.history ?? []) {
          counts[row.testName] = (counts[row.testName] ?? 0) + 1
          if (!prog[row.testName]) prog[row.testName] = { correct: 0, total: 0 }
          prog[row.testName].correct += row.correct
          prog[row.testName].total += row.total
          last[row.testName] = row.createdAt
        }
        setAttempts(counts)
        const pctMap: Record<string, number> = {}
        for (const [name, v] of Object.entries(prog)) {
          pctMap[name] = v.total ? Math.round((v.correct / v.total) * 100) : 0
        }
        setProgress(pctMap)
        setLastAttempted(last)
      })
      .catch(() => {})
  }, [])

  const filtered = tests.filter((t) => {
    const matchQ = t.name.toLowerCase().includes(query.toLowerCase())
    const matchC = category === "All" || t.category === category
    return matchQ && matchC
  })

  const recentlyPracticed = tests
    .filter((t) => lastAttempted[t.name])
    .sort((a, b) => new Date(lastAttempted[b.name]).getTime() - new Date(lastAttempted[a.name]).getTime())
    .slice(0, 3)

  const featured = tests[0]
  const showFeatured = category === "All" && query === ""

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Practice Tests</h1>
          <p className="mt-2 text-muted-foreground">Select your target test to generate MCQs.</p>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          {filtered.length} test{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Recently Practiced */}
      {recentlyPracticed.length > 0 && showFeatured && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-medium text-foreground">Continue where you left off</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentlyPracticed.map((t) => {
              const pct = progress[t.name] ?? 0
              const count = attempts[t.name] ?? 0
              return (
                <button
                  key={t.name}
                  onClick={() => router.push(`/tests/${encodeURIComponent(t.name)}`)}
                  className="group flex shrink-0 items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-400/30 hover:shadow-lg hover:shadow-black/20"
                >
                  <CircularProgress pct={pct} />
                  <div>
                    <div className="text-sm font-medium text-card-foreground">{t.name}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{count} attempt{count > 1 ? "s" : ""}</span>
                      <span>·</span>
                      <span>{t.estQs} questions</span>
                    </div>
                  </div>
                  <ChevronRight className="ml-2 h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Featured Test */}
      {showFeatured && (
        <button
          onClick={() => router.push(`/tests/${encodeURIComponent(featured.name)}`)}
          className="group relative w-full overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-transparent p-6 text-left transition hover:-translate-y-0.5 hover:border-indigo-400/40 active:scale-[0.99]"
        >
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-indigo-500/10 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="rounded-xl bg-indigo-400/10 p-3 text-indigo-400 transition group-hover:scale-110">
                <Shield className="h-6 w-6" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-foreground">{featured.name}</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
                    <Sparkles className="h-3 w-3" /> Full Syllabus Ready
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["5 Subjects", "Part A (MCQs)", "Part B (Subjective)", "Full Mock Test"].map((chip) => (
                    <span key={chip} className="rounded-full border border-border bg-card/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-indigo-400 px-4 py-2 text-xs font-semibold text-black transition group-hover:bg-indigo-300">
                Start Now
              </span>
              <ArrowUpRight className="h-5 w-5 text-indigo-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
          </div>
        </button>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tests..."
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-indigo-400/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
                category === c
                  ? "bg-indigo-400 text-black shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Test Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No tests found"
          desc="Try a different search term or category."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => {
            const count = attempts[t.name] ?? 0
            const pct = progress[t.name] ?? 0
            const hasSyllabus = !!getSyllabus(t.name)
            const isStarted = count > 0
            return (
              <button
                key={t.name}
                onClick={() => router.push(`/tests/${encodeURIComponent(t.name)}`)}
                style={{ animationDelay: `${i * 0.05}s` }}
                className="group flex flex-col rounded-xl border border-border bg-card p-5 text-left transition [animation-fill-mode:both] hover:-translate-y-1 hover:border-indigo-400/30 hover:shadow-lg hover:shadow-black/20 animate-fade-up"
              >
                <div className="flex items-start justify-between">
                  <span className={`inline-block rounded-lg p-2.5 transition group-hover:scale-110 ${t.color}`}>
                    <t.icon className="h-5 w-5" />
                  </span>
                  <div className="flex items-center gap-2">
                    {isStarted && <CircularProgress pct={pct} size={40} />}
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium text-card-foreground">{t.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">{t.category}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${difficultyColor(t.difficulty)}`}>
                      {t.difficulty}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {hasSyllabus && (
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                      Syllabus Ready
                    </span>
                  )}
                  {count >= 3 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-400/10 px-2 py-0.5 text-[10px] font-medium text-orange-400">
                      <Flame className="h-3 w-3" /> Popular
                    </span>
                  )}
                  {isStarted && (
                    <span className="text-[10px] text-muted-foreground">
                      {count} attempt{count > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> ~{Math.round(t.estQs * 0.75)}m
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <BarChart3 className="h-3 w-3" /> {t.estQs} Qs
                  </span>
                  <span className="ml-auto text-xs font-medium text-indigo-400 transition group-hover:translate-x-0.5">
                    {isStarted ? "Continue" : "Start"} <ChevronRight className="inline h-3 w-3" />
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}