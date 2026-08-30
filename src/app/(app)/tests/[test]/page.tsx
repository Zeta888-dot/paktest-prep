"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { loadSettings } from "@/lib/settings"
import { loadBookmarks, toggleSaved, type SavedQuestion } from "@/lib/bookmarks"
import { getSyllabus, type Subject } from "@/lib/syllabus"
import { Confetti } from "@/components/ui/confetti"
import { GenerationProgress } from "@/components/ui/generation-progress"
import {
  X,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  Bookmark,
  Timer,
  AlertCircle,
  Eye,
  Home,
  Share2,
  Loader2,
  Check,
  BookOpen,
  FolderOpen,
  ChevronLeft,
  PenLine,
  Flag,
  Keyboard,
  Zap,
  ChevronRight,
} from "lucide-react"

type Question = {
  question: string
  options: string[]
  answer: string
  explanation: string
}

function CircularTimer({ duration, onTimeout, keyReset }: { duration: number; onTimeout: () => void; keyReset: number }) {
  const [left, setLeft] = useState(duration)
  const radius = 18
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    setLeft(duration)
    const interval = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [keyReset, duration, onTimeout])

  const pct = left / duration
  const offset = circumference * (1 - pct)
  const color = pct > 0.5 ? "text-indigo-400" : pct > 0.2 ? "text-amber-400" : "text-red-400"

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10">
        <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
          <circle cx="20" cy="20" r={radius} fill="none" strokeWidth="3" stroke="currentColor" className="text-muted" />
          <circle
            cx="20"
            cy="20"
            r={radius}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            stroke="currentColor"
            className={`${color} transition-all duration-1000`}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
          {left}
        </span>
      </div>
      <span className="text-xs text-muted-foreground">seconds</span>
    </div>
  )
}

function QuestionPalette({
  total,
  current,
  answers,
  flagged,
  onJump,
}: {
  total: number
  current: number
  answers: Record<number, string>
  flagged: Set<number>
  onJump: (i: number) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-[10px] font-bold text-primary">
          {current + 1}
        </span>
        <span>/ {total}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-border bg-card p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-card-foreground">Question Palette</span>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: total }, (_, i) => {
                const answered = answers[i] !== undefined
                const isFlagged = flagged.has(i)
                const isCurrent = i === current
                return (
                  <button
                    key={i}
                    onClick={() => {
                      onJump(i)
                      setOpen(false)
                    }}
                    className={`relative flex h-8 items-center justify-center rounded-md text-xs font-medium transition ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : answered
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {i + 1}
                    {isFlagged && (
                      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400" />
                    )}
                  </button>
                )
              })}
            </div>
            <div className="mt-3 flex items-center gap-3 border-t border-border pt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Answered</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Current</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Flagged</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function TestPracticePage() {
  const params = useParams<{ test: string }>()
  const router = useRouter()
  const testName = decodeURIComponent(params.test ?? "")
  const syllabus = getSyllabus(testName)

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [source, setSource] = useState<"syllabus" | "material">("syllabus")
  const [count, setCount] = useState(5)
  const [ready, setReady] = useState(false)

  const [phase, setPhase] = useState<"source" | "subject" | "topic" | "quiz">("source")
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")

  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const correctCountRef = useRef(0)
  const [done, setDone] = useState(false)
  const [showExpl, setShowExpl] = useState(false)
  const [saved, setSaved] = useState<SavedQuestion[]>([])
  const [reviewMode, setReviewMode] = useState(false)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [sharing, setSharing] = useState(false)
  const [shared, setShared] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [caption, setCaption] = useState("")
  const submitted = useRef(false)
  const startedAtRef = useRef<number>(0)

  useEffect(() => {
    const s = loadSettings()
    setSource(s.defaultSource)
    setCount(s.questionsPerTest)
    setReady(true)
    setSaved(loadBookmarks())
  }, [])

  const topicString = selectedTopics.length > 0
    ? `${selectedSubject?.name}: ${selectedTopics.join(", ")}`
    : selectedSubject?.name || testName

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    setError("")
    setIndex(0)
    setPicked(null)
    setCorrectCount(0)
    correctCountRef.current = 0
    setDone(false)
    setShowExpl(false)
    setReviewMode(false)
    setAnswers({})
    setFlagged(new Set())
    setShared(false)
    setShowShare(false)
    submitted.current = false
    try {
      const url = source === "material" ? "/api/generate-rag" : "/api/generate"
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: testName, topic: topicString, count, difficulty }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate questions")
      setQuestions(data.questions ?? [])
      startedAtRef.current = Date.now()
      setPhase("quiz")
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [testName, source, count, topicString, difficulty])

  const q = questions[index]
  const answered = picked !== null

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (phase !== "quiz" || loading || error || done || reviewMode || !q) return
      if (["1", "2", "3", "4"].includes(e.key) && !answered) {
        const opt = q.options[Number(e.key) - 1]
        if (opt) pick(opt)
      } else if (e.key === "Enter" && answered) {
        next()
      } else if (e.key === "f" || e.key === "F") {
        toggleFlag()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  function pick(opt: string) {
    if (answered) return
    setPicked(opt)
    setShowExpl(false)
    setAnswers((prev) => ({ ...prev, [index]: opt }))
    if (opt === q.answer) {
      setCorrectCount((c) => c + 1)
      correctCountRef.current += 1
    }
  }

  function next() {
    if (index + 1 >= questions.length) {
      setDone(true)
      if (!submitted.current) {
        submitted.current = true
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testName,
            source,
            correct: correctCountRef.current,
            total: questions.length,
            duration: startedAtRef.current
              ? Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000))
              : null,
          }),
        })
      }
    } else {
      setIndex(index + 1)
      setPicked(null)
      setShowExpl(false)
    }
  }

  function toggleBookmark() {
    if (!q) return
    setSaved(
      toggleSaved(testName, q.question, {
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
      })
    )
  }

  function toggleFlag() {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function jumpTo(i: number) {
    if (i < 0 || i >= questions.length) return
    setIndex(i)
    setPicked(answers[i] ?? null)
    setShowExpl(false)
  }

  function restart() {
    setPhase(syllabus ? "subject" : "source")
    setSelectedSubject(null)
    setSelectedTopics([])
    loadQuestions()
  }

  function handleTimeout() {
    if (!answered && q) {
      setPicked("__timeout__")
      setAnswers((prev) => ({ ...prev, [index]: "__timeout__" }))
    }
  }

  function openShare() {
    const pct = questions.length ? Math.round((correctCountRef.current / questions.length) * 100) : 0
    setCaption(`Spent some time on ${testName} today. ${pct}% score. Each attempt teaches me something new.`)
    setShowShare(true)
  }

  async function shareToForum() {
    if (!questions.length || !caption.trim()) return
    setSharing(true)
    try {
      const pct = Math.round((correctCountRef.current / questions.length) * 100)
      await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: loadSettings().displayName || "Anonymous",
          title: `${testName} Practice: ${pct}%`,
          body: caption.trim(),
        }),
      })
      setShared(true)
      setShowShare(false)
    } catch {
      // ignore
    } finally {
      setSharing(false)
    }
  }

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  function selectAllTopics() {
    if (!selectedSubject) return
    if (selectedTopics.length === selectedSubject.topics.length) {
      setSelectedTopics([])
    } else {
      setSelectedTopics([...selectedSubject.topics])
    }
  }

  if (loading) return <GenerationProgress />

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-up">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">Oops!</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{error}</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => { setError(""); if (phase === "topic") loadQuestions() }}>
            <RotateCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
          <Button variant="outline" onClick={() => router.push("/tests")}>
            Back to Tests
          </Button>
        </div>
      </div>
    )
  }

  if (phase === "source") {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{testName}</h1>
          <p className="mt-2 text-muted-foreground">Where should we generate questions from?</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => {
              setSource("syllabus")
              if (syllabus) setPhase("subject")
              else loadQuestions()
            }}
            className="group rounded-xl border border-border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent active:scale-[0.98]"
          >
            <span className="inline-block rounded-lg bg-indigo-400/10 p-2 text-indigo-400">
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="mt-3 font-medium text-card-foreground">From Syllabus</div>
            <p className="mt-1 text-sm text-muted-foreground">AI-generated MCQs based on the official syllabus.</p>
          </button>
          <button
            onClick={() => {
              setSource("material")
              loadQuestions()
            }}
            className="group rounded-xl border border-border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent active:scale-[0.98]"
          >
            <span className="inline-block rounded-lg bg-violet-400/10 p-2 text-violet-400">
              <FolderOpen className="h-5 w-5" />
            </span>
            <div className="mt-3 font-medium text-card-foreground">From My Material</div>
            <p className="mt-1 text-sm text-muted-foreground">MCQs from the notes you uploaded for this test.</p>
          </button>
          {syllabus && (
            <button
              onClick={() => router.push(`/tests/${encodeURIComponent(testName)}/partb`)}
              className="group rounded-xl border border-border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent active:scale-[0.98]"
            >
              <span className="inline-block rounded-lg bg-emerald-400/10 p-2 text-emerald-400">
                <PenLine className="h-5 w-5" />
              </span>
              <div className="mt-3 font-medium text-card-foreground">Part B (Subjective)</div>
              <p className="mt-1 text-sm text-muted-foreground">Translation and sentence formation with instant checking.</p>
            </button>
          )}
          {syllabus && (
            <button
              onClick={() => router.push(`/tests/${encodeURIComponent(testName)}/mock`)}
              className="group rounded-xl border border-border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent active:scale-[0.98]"
            >
              <span className="inline-block rounded-lg bg-orange-400/10 p-2 text-orange-400">
                <Timer className="h-5 w-5" />
              </span>
              <div className="mt-3 font-medium text-card-foreground">Full Mock Test</div>
              <p className="mt-1 text-sm text-muted-foreground">100 marks, timed exam simulation with Part A and Part B.</p>
            </button>
          )}
        </div>
      </div>
    )
  }

  if (phase === "subject" && syllabus) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <button onClick={() => setPhase("source")} className="text-muted-foreground hover:text-foreground transition">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{testName}</h1>
            <p className="mt-1 text-muted-foreground">Select a subject</p>
          </div>
        </div>
        <div className="grid gap-3">
          {syllabus.subjects.map((subj) => (
            <button
              key={subj.name}
              onClick={() => {
                setSelectedSubject(subj)
                setSelectedTopics([])
                setPhase("topic")
              }}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent active:scale-[0.98]"
            >
              <div>
                <div className="font-medium text-card-foreground">{subj.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{subj.topics.length} topics</div>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {subj.weightage}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (phase === "topic" && selectedSubject) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <button onClick={() => setPhase("subject")} className="text-muted-foreground hover:text-foreground transition">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{selectedSubject.name}</h1>
            <p className="mt-1 text-muted-foreground">Select topics and difficulty</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(["easy", "medium", "hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition active:scale-[0.98] ${
                difficulty === d
                  ? d === "easy"
                    ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400"
                    : d === "medium"
                    ? "border-amber-400/50 bg-amber-400/10 text-amber-400"
                    : "border-red-400/50 bg-red-400/10 text-red-400"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <button
          onClick={selectAllTopics}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
            selectedTopics.length === selectedSubject.topics.length
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          {selectedTopics.length === selectedSubject.topics.length ? "✓ All Topics Selected" : "Select All Topics"}
        </button>

        <div className="grid gap-2">
          {selectedSubject.topics.map((topic) => {
            const isSelected = selectedTopics.includes(topic)
            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition active:scale-[0.98] ${
                  isSelected
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </span>
                {topic}
              </button>
            )
          })}
        </div>

        <Button onClick={loadQuestions} disabled={selectedTopics.length === 0} className="w-full gap-2">
          Generate MCQs ({selectedTopics.length} topic{selectedTopics.length > 1 ? "s" : ""}){" "}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (phase !== "quiz") return null

  const savedForTest = saved.filter((b) => b.test === testName)

  if (done && !reviewMode) {
    const pct = questions.length ? Math.round((correctCountRef.current / questions.length) * 100) : 0
    const isWin = pct >= 80
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center animate-fade-up">
        {isWin && <Confetti />}
        <div className={`rounded-full p-4 ${isWin ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
          <Trophy className={`h-10 w-10 ${isWin ? "text-emerald-400" : "text-amber-400"}`} />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-foreground">Test Complete!</h1>
        <p className="mt-2 text-muted-foreground">
          You scored {correctCountRef.current}/{questions.length} ({pct}%)
        </p>
        {savedForTest.length > 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            {savedForTest.length} question{savedForTest.length > 1 ? "s" : ""} saved for review
          </p>
        )}

        <div className="mt-8 w-full max-w-sm space-y-3">
          {showShare ? (
            <div className="space-y-3 rounded-xl border border-border bg-card p-4 text-left">
              <div className="text-sm font-medium text-card-foreground">Share to Forum</div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={shareToForum} disabled={sharing || !caption.trim()} className="gap-2">
                  {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} Post
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowShare(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={openShare} disabled={sharing || shared} className="w-full gap-2">
              {shared ? (
                <>
                  <Check className="h-4 w-4" /> Shared to Forum
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" /> Share Result on Forum
                </>
              )}
            </Button>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={restart} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Practice Again
            </Button>
            <Button variant="outline" onClick={() => setReviewMode(true)} className="gap-2">
              <Eye className="h-4 w-4" /> Review Answers
            </Button>
            <Button variant="outline" onClick={() => router.push("/tests")}>
              Back to Tests
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (reviewMode) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Review Answers</h2>
          <Button variant="outline" size="sm" onClick={() => setReviewMode(false)} className="gap-2">
            <X className="h-4 w-4" /> Close
          </Button>
        </div>
        <div className="space-y-4">
          {questions.map((qItem, i) => {
            const userAns = answers[i]
            const correct = userAns === qItem.answer
            const timedOut = userAns === "__timeout__"
            return (
              <div
                key={i}
                className={`rounded-xl border p-4 ${
                  correct
                    ? "border-emerald-400/30 bg-emerald-400/5"
                    : timedOut
                    ? "border-amber-400/30 bg-amber-400/5"
                    : "border-red-400/30 bg-red-400/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {i + 1}. {qItem.question}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      correct
                        ? "bg-emerald-400/10 text-emerald-400"
                        : timedOut
                        ? "bg-amber-400/10 text-amber-400"
                        : "bg-red-400/10 text-red-400"
                    }`}
                  >
                    {correct ? "Correct" : timedOut ? "Timed Out" : "Wrong"}
                  </span>
                </div>
                <div className="mt-2 space-y-1">
                  {qItem.options.map((opt, j) => {
                    const isUser = userAns === opt
                    const isAns = opt === qItem.answer
                    let cls = "text-muted-foreground"
                    if (isAns) cls = "font-medium text-emerald-400"
                    else if (isUser && !isAns) cls = "font-medium text-red-400 line-through"
                    return (
                      <div key={j} className={`text-sm ${cls}`}>
                        {String.fromCharCode(65 + j)}. {opt}
                        {isAns && " ✓"}
                      </div>
                    )
                  })}
                </div>
                <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                  {qItem.explanation}
                </p>
              </div>
            )
          })}
        </div>
        <div className="flex justify-center gap-3 pb-8">
          <Button onClick={restart} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Practice Again
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="gap-2">
            <Home className="h-4 w-4" /> Dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!q) return <div className="text-muted-foreground">No questions.</div>

  const isBookmarked = saved.some((b) => b.test === testName && b.question === q.question)
  const isCorrect = answered && q !== undefined && picked === q.answer
  const isFlagged = flagged.has(index)

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
      {/* Top Bar */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/tests")} className="text-muted-foreground transition hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-indigo-400 transition-all duration-500"
            style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        <QuestionPalette
          total={questions.length}
          current={index}
          answers={answers}
          flagged={flagged}
          onJump={jumpTo}
        />
      </div>

      {/* Timer + Flag */}
      <div className="flex items-center justify-between">
        <CircularTimer duration={45} onTimeout={handleTimeout} keyReset={index} />
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFlag}
            className={`rounded-lg p-2 transition active:scale-90 ${
              isFlagged ? "bg-amber-400/10 text-amber-400" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            title={isFlagged ? "Unflag question" : "Flag for review"}
          >
            <Flag className={`h-4 w-4 ${isFlagged ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={toggleBookmark}
            className={`rounded-lg p-2 transition active:scale-90 ${
              isBookmarked ? "bg-yellow-400/10 text-yellow-400" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            title={isBookmarked ? "Remove from saved" : "Save this question"}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Question */}
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-xs font-bold text-indigo-400">
          {index + 1}
        </span>
        <h1 className="text-lg font-semibold leading-relaxed text-foreground sm:text-xl">{q.question}</h1>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {q.options.map((opt, j) => {
          const isPick = picked === opt
          const isAns = opt === q.answer
          let cls = "border-border bg-card text-foreground hover:border-indigo-400/40 hover:bg-indigo-400/5 hover:shadow-sm hover:shadow-indigo-500/5"
          if (answered && isAns) cls = "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          else if (answered && isPick && !isAns) cls = "border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
          else if (answered) cls = "border-border/40 bg-card/50 text-muted-foreground"
          return (
            <button
              key={j}
              onClick={() => pick(opt)}
              disabled={answered}
              className={`group flex w-full items-center gap-3 rounded-xl border px-5 py-3.5 text-left text-sm transition active:scale-[0.98] ${cls} disabled:cursor-not-allowed`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition ${
                answered && isAns
                  ? "bg-emerald-500 text-white"
                  : answered && isPick && !isAns
                  ? "bg-red-500 text-white"
                  : answered
                  ? "bg-muted text-muted-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-indigo-500/10 group-hover:text-indigo-400"
              }`}>
                {String.fromCharCode(65 + j)}
              </span>
              <span className="flex-1">{opt}</span>
              {answered && isAns && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />}
              {answered && isPick && !isAns && <XCircle className="h-5 w-5 shrink-0 text-red-400" />}
            </button>
          )
        })}
      </div>

      {/* Keyboard Hints */}
      {!answered && (
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Keyboard className="h-3 w-3" />
            Press <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">1-4</kbd> to answer
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">F</kbd> to flag
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">Enter</kbd> for next
          </span>
        </div>
      )}

      {/* Feedback */}
      {answered && (
        <div
          className={`rounded-xl border p-4 ${
            isCorrect
              ? "animate-bounce-in border-emerald-500/30 bg-emerald-500/5"
              : "animate-shake border-red-500/30 bg-red-500/5"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="h-6 w-6 shrink-0 text-red-400" />
              )}
              <span className={`font-medium ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
                {isCorrect ? "Correct!" : picked === "__timeout__" ? "Time's up!" : "Wrong!"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExpl(!showExpl)}
                className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
              >
                Explanation
                <ChevronDown className={`h-4 w-4 transition-transform ${showExpl ? "rotate-180" : ""}`} />
              </button>
              <Button onClick={next} className="gap-2 bg-indigo-400 text-black hover:bg-indigo-300">
                {index + 1 >= questions.length ? "Finish" : "Next"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {showExpl && (
            <div className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
              {q.explanation}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => jumpTo(index - 1)}
          disabled={index === 0}
          className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <button
          onClick={() => jumpTo(index + 1)}
          disabled={index === questions.length - 1 || !answered}
          className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground disabled:opacity-30"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}