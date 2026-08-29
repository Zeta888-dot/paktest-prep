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
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { getSyllabus } from "@/lib/syllabus"

const tests = [
  { name: "Police Constable (KPK / Islamabad)", icon: Shield, color: "bg-blue-400/10 text-blue-400", category: "Defense & Police" },
  { name: "Junior / Senior Clerk", icon: FileText, color: "bg-amber-400/10 text-amber-400", category: "Clerical & Admin" },
  { name: "Stenotypist", icon: Keyboard, color: "bg-pink-400/10 text-pink-400", category: "Clerical & Admin" },
  { name: "ASF", icon: Shield, color: "bg-cyan-400/10 text-cyan-400", category: "Defense & Police" },
  { name: "Air Force Commission Posts", icon: Plane, color: "bg-sky-400/10 text-sky-400", category: "Defense & Police" },
  { name: "MDCAT", icon: HeartPulse, color: "bg-red-400/10 text-red-400", category: "Medical & Engineering" },
  { name: "ECAT", icon: Cog, color: "bg-orange-400/10 text-orange-400", category: "Medical & Engineering" },
  { name: "SST (Senior Subject Specialist)", icon: GraduationCap, color: "bg-purple-400/10 text-purple-400", category: "Teaching" },
  { name: "CT (Certified Teacher)", icon: BookOpen, color: "bg-emerald-400/10 text-emerald-400", category: "Teaching" },
  { name: "PST (Primary School Teacher)", icon: School, color: "bg-teal-400/10 text-teal-400", category: "Teaching" },
  { name: "PASI (Assistant Sub Inspector)", icon: BadgeCheck, color: "bg-indigo-400/10 text-indigo-400", category: "Defense & Police" },
  { name: "CSS & PMS", icon: Landmark, color: "bg-yellow-400/10 text-yellow-400", category: "Civil Services" },
]

const categories = ["All", "Defense & Police", "Clerical & Admin", "Teaching", "Medical & Engineering", "Civil Services"]

export default function TestsPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [attempts, setAttempts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => {
        const counts: Record<string, number> = {}
        for (const row of d.history ?? []) {
          counts[row.testName] = (counts[row.testName] ?? 0) + 1
        }
        setAttempts(counts)
      })
      .catch(() => {})
  }, [])

  const filtered = tests.filter((t) => {
    const matchQ = t.name.toLowerCase().includes(query.toLowerCase())
    const matchC = category === "All" || t.category === category
    return matchQ && matchC
  })

  const featured = tests[0]
  const showFeatured = category === "All" && query === ""

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Practice Tests</h1>
          <p className="mt-2 text-muted-foreground">Select your target test to generate MCQs.</p>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          {filtered.length} test{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {showFeatured && (
        <button
          onClick={() => router.push(`/tests/${encodeURIComponent(featured.name)}`)}
          className="group relative w-full overflow-hidden rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-400/10 via-cyan-400/5 to-transparent p-6 text-left transition hover:-translate-y-0.5 hover:border-emerald-400/40 active:scale-[0.99]"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="rounded-xl bg-emerald-400/10 p-3 text-emerald-400 transition group-hover:scale-110">
                <Shield className="h-6 w-6" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-foreground">{featured.name}</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
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
            <ArrowUpRight className="h-5 w-5 text-emerald-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </button>
      )}

      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tests..."
          className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition active:scale-95 ${
              category === c
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

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
            const hasSyllabus = !!getSyllabus(t.name)
            return (
              <button
                key={t.name}
                onClick={() => router.push(`/tests/${encodeURIComponent(t.name)}`)}
                style={{ animationDelay: `${i * 0.05}s` }}
                className="group flex items-start justify-between rounded-xl border border-border bg-card p-5 text-left transition [animation-fill-mode:both] hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent animate-fade-up"
              >
                <div>
                  <span className={`inline-block rounded-lg p-2 transition group-hover:scale-110 ${t.color}`}>
                    <t.icon className="h-4 w-4" />
                  </span>
                  <div className="mt-3 text-sm font-medium text-card-foreground">{t.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{t.category}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
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
                    {count > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {count} attempt{count > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}