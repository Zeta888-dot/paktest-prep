"use client"

import { useEffect, useState } from "react"
import { BarChart3, HelpCircle, Target, History } from "lucide-react"
import { loadSettings } from "@/lib/settings"

type HistoryRow = {
  id: string
  testName: string
  source: string
  correct: number
  total: number
  createdAt: string
}

export default function DashboardPage() {
  const [rows, setRows] = useState<HistoryRow[]>([])
  const [name, setName] = useState("")

  useEffect(() => {
    setName(loadSettings().displayName)
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setRows(d.history ?? []))
  }, [])

  const attempts = rows.length
  const answered = rows.reduce((a, r) => a + r.total, 0)
  const accuracy = answered
    ? Math.round((rows.reduce((a, r) => a + r.correct, 0) / answered) * 100)
    : 0

  const stats = [
    { icon: BarChart3, label: "Attempts", value: attempts, color: "bg-blue-400/10 text-blue-400" },
    { icon: HelpCircle, label: "Questions Answered", value: answered, color: "bg-purple-400/10 text-purple-400" },
    { icon: Target, label: "Accuracy", value: `${accuracy}%`, color: "bg-emerald-400/10 text-emerald-400" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Welcome back{name ? `, ${name}` : ""}
        </h1>
        <p className="mt-2 text-white/50">Select a test to start practicing.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-white/20"
          >
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span className={`rounded-lg p-1.5 transition group-hover:scale-110 ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </span>
              {s.label}
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-white/50" />
          <h2 className="font-medium text-white">Recent Attempts</h2>
        </div>
        {rows.length === 0 && (
          <p className="text-sm text-white/50">No attempts yet. Take your first test!</p>
        )}
        {rows.slice(0, 5).map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm transition hover:bg-white/[0.06]"
          >
            <div>
              <span className="font-medium text-white">{r.testName}</span>
              <span className="ml-2 text-white/40">({r.source})</span>
            </div>
            <div className="flex items-center gap-3 text-white/50">
              <span>
                {r.correct}/{r.total}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                {Math.round((r.correct / r.total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}