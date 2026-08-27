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
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Practice Tests</h1>
        <p className="mt-2 text-muted-foreground">Select your target test to generate MCQs.</p>
      </div>

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
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
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
          {filtered.map((t) => {
            const count = attempts[t.name] ?? 0
            return (
              <button
                key={t.name}
                onClick={() => router.push(`/tests/${encodeURIComponent(t.name)}`)}
                className="group flex items-start justify-between rounded-xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent"
              >
                <div>
                  <span className={`inline-block rounded-lg p-2 ${t.color}`}>
                    <t.icon className="h-4 w-4" />
                  </span>
                  <div className="mt-3 text-sm font-medium text-card-foreground">{t.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{t.category}</div>
                  <div className="mt-2 flex items-center gap-2">
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
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition group-hover:text-foreground" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}