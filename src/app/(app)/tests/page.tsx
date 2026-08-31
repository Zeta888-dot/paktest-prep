"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  ArrowUpRight,
  SearchX,
  Clock,
  BarChart3,
  ChevronRight,
  RotateCcw,
  Loader2,
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { getSyllabus } from "@/lib/syllabus"

/* ── Custom field SVG icons (solid, mature, no generic portfolio vibe) ── */
function PoliceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
      <path d="M12 7v10" />
      <path d="M9 10h6" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ClerkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
    </svg>
  )
}

function StenoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M6 10h.01" strokeWidth="3" />
      <path d="M10 10h.01" strokeWidth="3" />
      <path d="M14 10h.01" strokeWidth="3" />
      <path d="M18 10h.01" strokeWidth="3" />
      <path d="M8 14h.01" strokeWidth="3" />
      <path d="M12 14h.01" strokeWidth="3" />
      <path d="M16 14h.01" strokeWidth="3" />
    </svg>
  )
}

function ASFIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 6v6c0 6.6 3.4 12 8 14 4.6-2 8-7.4 8-14V6l-8-4z" />
      <path d="M9 10l3 3 3-3" />
      <path d="M12 13v4" />
    </svg>
  )
}

function AirForceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h20" />
      <path d="M2 12l4-4h12l4 4-4 4H6l-4-4z" />
      <path d="M12 2v6" />
      <path d="M12 16v6" />
      <path d="M8 6l4-4 4 4" />
    </svg>
  )
}

function MedicalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 12.5c-1.5 2.5-1.5 5.5 0 8" />
      <path d="M19.5 12.5c1.5 2.5 1.5 5.5 0 8" />
      <circle cx="12" cy="10" r="7" />
      <path d="M12 7v6" />
      <path d="M9 10h6" />
    </svg>
  )
}

function EngIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

function TeachingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7l10-5 10 5-10 5-10-5z" />
      <path d="M6 9v6" />
      <path d="M18 9v6" />
      <path d="M2 17l10 5 10-5" />
      <path d="M12 22V12" />
    </svg>
  )
}

function CivilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
      <path d="M10 9h4" />
      <path d="M10 12h4" />
    </svg>
  )
}

const tests = [
  { name: "Police Constable (KPK / Islamabad)", icon: PoliceIcon, color: "bg-blue-600", category: "Defense & Police", difficulty: "Medium", estQs: 100 },
  { name: "Junior / Senior Clerk", icon: ClerkIcon, color: "bg-amber-600", category: "Clerical & Admin", difficulty: "Easy", estQs: 75 },
  { name: "Stenotypist", icon: StenoIcon, color: "bg-rose-600", category: "Clerical & Admin", difficulty: "Medium", estQs: 80 },
  { name: "ASF", icon: ASFIcon, color: "bg-cyan-700", category: "Defense & Police", difficulty: "Hard", estQs: 120 },
  { name: "Air Force Commission Posts", icon: AirForceIcon, color: "bg-sky-700", category: "Defense & Police", difficulty: "Hard", estQs: 150 },
  { name: "MDCAT", icon: MedicalIcon, color: "bg-red-600", category: "Medical & Engineering", difficulty: "Hard", estQs: 200 },
  { name: "ECAT", icon: EngIcon, color: "bg-orange-600", category: "Medical & Engineering", difficulty: "Medium", estQs: 150 },
  { name: "SST (Senior Subject Specialist)", icon: TeachingIcon, color: "bg-purple-600", category: "Teaching", difficulty: "Medium", estQs: 100 },
  { name: "CT (Certified Teacher)", icon: TeachingIcon, color: "bg-emerald-700", category: "Teaching", difficulty: "Easy", estQs: 80 },
  { name: "PST (Primary School Teacher)", icon: TeachingIcon, color: "bg-teal-700", category: "Teaching", difficulty: "Easy", estQs: 75 },
  { name: "PASI (Assistant Sub Inspector)", icon: PoliceIcon, color: "bg-indigo-700", category: "Defense & Police", difficulty: "Hard", estQs: 120 },
  { name: "CSS & PMS", icon: CivilIcon, color: "bg-yellow-700", category: "Civil Services", difficulty: "Hard", estQs: 300 },
]

const categories = ["All", "Defense & Police", "Clerical & Admin", "Teaching", "Medical & Engineering", "Civil Services"]

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
          className="text-primary transition-all duration-500"
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
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)

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

  function handleNavigate(testName: string) {
    setNavigatingTo(testName)
    router.push(`/tests/${encodeURIComponent(testName)}`)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Practice Tests</h1>
          <p className="mt-2 text-muted-foreground">Select your target test to generate MCQs.</p>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          {filtered.length} test{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* ── Recently practiced ── */}
      {recentlyPracticed.length > 0 && showFeatured && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-medium text-foreground">Continue where you left off</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyPracticed.map((t) => {
              const pct = progress[t.name] ?? 0
              const count = attempts[t.name] ?? 0
              const isNavigating = navigatingTo === t.name
              return (
                <button
                  key={t.name}
                  onClick={() => handleNavigate(t.name)}
                  disabled={isNavigating}
                  className="group relative flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/40 hover:bg-accent/30 disabled:cursor-wait"
                >
                  {isNavigating && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-card/80">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                  <CircularProgress pct={pct} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-card-foreground">{t.name}</div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{count} attempt{count > 1 ? "s" : ""}</span>
                      <span className="text-border">·</span>
                      <span>{t.estQs} questions</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Featured test ── */}
      {showFeatured && (
        <button
          onClick={() => handleNavigate(featured.name)}
          disabled={navigatingTo === featured.name}
          className="group relative w-full overflow-hidden rounded-2xl border border-border bg-card p-6 text-left transition hover:border-primary/30 disabled:cursor-wait"
        >
          {navigatingTo === featured.name && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-card/80">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="rounded-xl bg-blue-600 p-3 text-white">
                <PoliceIcon className="h-6 w-6" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-foreground">{featured.name}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-medium text-white">
                    Full Syllabus Ready
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["5 Subjects", "Part A (MCQs)", "Part B (Subjective)", "Full Mock Test"].map((chip) => (
                    <span key={chip} className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition group-hover:bg-primary/90">
                Start Now
              </span>
              <ArrowUpRight className="h-5 w-5 text-primary transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </button>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tests..."
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
                category === c
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No tests found"
          desc="Try a different search term or category."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => {
            const count = attempts[t.name] ?? 0
            const pct = progress[t.name] ?? 0
            const hasSyllabus = !!getSyllabus(t.name)
            const isStarted = count > 0
            const Icon = t.icon
            const isNavigating = navigatingTo === t.name
            return (
              <button
                key={t.name}
                onClick={() => handleNavigate(t.name)}
                disabled={isNavigating}
                className="group relative flex flex-col rounded-xl border border-border bg-card p-5 text-left transition hover:border-primary/30 disabled:cursor-wait"
              >
                {isNavigating && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-card/80">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <span className={`inline-block rounded-lg p-2.5 text-white ${t.color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex items-center gap-2">
                    {isStarted && <CircularProgress pct={pct} size={40} />}
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground" />
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm font-medium text-card-foreground">{t.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{t.category}</div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {hasSyllabus && (
                    <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white">
                      Syllabus Ready
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
                  <span className="ml-auto text-xs font-medium text-primary transition group-hover:translate-x-0.5">
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