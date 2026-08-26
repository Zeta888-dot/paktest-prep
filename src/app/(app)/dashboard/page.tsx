"use client"

import { useEffect, useState } from "react"
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back{name ? `, ${name}` : ""}
        </h1>
        <p className="mt-2 text-muted-foreground">Select a test to start practicing.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">Attempts</div>
          <div className="mt-1 text-2xl font-semibold text-card-foreground">{attempts}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">Questions Answered</div>
          <div className="mt-1 text-2xl font-semibold text-card-foreground">{answered}</div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="text-sm text-muted-foreground">Accuracy</div>
          <div className="mt-1 text-2xl font-semibold text-card-foreground">{accuracy}%</div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-medium text-foreground">Recent Attempts</h2>
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">No attempts yet. Take your first test!</p>
        )}
        {rows.slice(0, 5).map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-3 text-sm"
          >
            <div>
              <span className="font-medium text-card-foreground">{r.testName}</span>
              <span className="ml-2 text-muted-foreground">({r.source})</span>
            </div>
            <div className="text-muted-foreground">
              {r.correct}/{r.total} — {Math.round((r.correct / r.total) * 100)}%
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}