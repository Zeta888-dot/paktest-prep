"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { loadBookmarks, saveBookmarks, type SavedQuestion } from "@/lib/bookmarks"
import {
  Bookmark,
  Trash2,
  ArrowRight,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"

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

export default function SavedPage() {
  const router = useRouter()
  const [list, setList] = useState<SavedQuestion[]>([])
  const [practice, setPractice] = useState(false)
  const [pIndex, setPIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    setList(loadBookmarks())
  }, [])

  const practicable = list.filter((b) => b.options && b.answer)

  function remove(id: string) {
    const next = list.filter((b) => b.id !== id)
    saveBookmarks(next)
    setList(next)
  }

  function startPractice() {
    setPractice(true)
    setPIndex(0)
    setPicked(null)
    setScore(0)
    setFinished(false)
  }

  const q = practicable[pIndex]

  function pick(opt: string) {
    if (picked || !q) return
    setPicked(opt)
    if (opt === q.answer) setScore((s) => s + 1)
  }

  function next() {
    if (pIndex + 1 >= practicable.length) setFinished(true)
    else {
      setPIndex(pIndex + 1)
      setPicked(null)
    }
  }

  if (practice && finished) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center animate-fade-up">
        <Trophy className="h-14 w-14 text-yellow-400" />
        <h1 className="mt-6 text-3xl font-semibold text-foreground">Revision Complete!</h1>
        <p className="mt-2 text-muted-foreground">
          You scored {score}/{practicable.length}
        </p>
        <div className="mt-8 flex gap-3">
          <Button onClick={startPractice} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Practice Again
          </Button>
          <Button variant="outline" onClick={() => setPractice(false)}>
            Back to Saved
          </Button>
        </div>
      </div>
    )
  }

  if (practice && q) {
    const answered = picked !== null
    const isCorrect = picked === q.answer
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
        <div className="flex items-center gap-4">
          <button onClick={() => setPractice(false)} className="text-muted-foreground transition hover:text-foreground">
            <XCircle className="h-5 w-5" />
          </button>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${((pIndex + (answered ? 1 : 0)) / practicable.length) * 100}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {pIndex + 1}/{practicable.length}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          <span className="rounded-full border border-border bg-muted px-2 py-0.5">{q.test}</span>
        </div>

        <h1 className="text-xl font-semibold text-foreground">{q.question}</h1>

        <div className="space-y-3">
          {(q.options ?? []).map((opt, j) => {
            const isPick = picked === opt
            const isAns = opt === q.answer
            let cls = "border-border bg-card text-foreground hover:border-border/80 hover:bg-accent"
            if (answered && isAns) cls = "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
            else if (answered && isPick && !isAns) cls = "border-red-400/50 bg-red-400/10 text-red-300"
            else if (answered) cls = "border-border/40 bg-card/50 text-muted-foreground"
            return (
              <button
                key={j}
                onClick={() => pick(opt)}
                disabled={answered}
                className={`w-full rounded-xl border px-5 py-3 text-left text-sm transition ${cls} disabled:cursor-not-allowed`}
              >
                <span className="mr-2 font-medium text-muted-foreground">{String.fromCharCode(65 + j)}.</span>
                {opt}
              </button>
            )
          })}
        </div>

        {answered && (
          <div
            className={`rounded-xl border p-4 ${
              isCorrect ? "border-emerald-400/30 bg-emerald-400/10" : "border-red-400/30 bg-red-400/10"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-6 w-6 shrink-0 text-red-400" />
                )}
                <span className={`font-medium ${isCorrect ? "text-emerald-300" : "text-red-300"}`}>
                  {isCorrect ? "Correct!" : "Wrong!"}
                </span>
              </div>
              <Button onClick={next} className="gap-2">
                {pIndex + 1 >= practicable.length ? "Finish" : "Next"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {q.explanation && (
              <div className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">{q.explanation}</div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Saved Questions</h1>
          <p className="mt-2 text-muted-foreground">Review the questions you bookmarked during practice.</p>
        </div>
        {practicable.length > 0 && (
          <Button onClick={startPractice} className="gap-2">
            <Play className="h-4 w-4" /> Practice ({practicable.length})
          </Button>
        )}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved questions yet"
          desc="Bookmark tricky questions during practice and they will appear here for revision."
          action={
            <Button onClick={() => router.push("/tests")} className="gap-2">
              Browse Tests <ArrowRight className="h-4 w-4" />
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {list.map((b) => (
            <div
              key={b.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card px-5 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-card-foreground">{b.question}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5">{b.test}</span>
                  <span>{timeAgo(b.savedAt)}</span>
                </div>
              </div>
              <button
                onClick={() => remove(b.id)}
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}