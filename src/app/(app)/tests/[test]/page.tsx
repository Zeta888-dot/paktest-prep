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
  const color = pct > 0.5 ? "text-primary" : pct > 0.2 ? "text-amber-500" : "text-red-500"

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10">
        <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
          <circle cx="20" cy="20" r={radius} fill="none" strokeWidth="3" stroke="currentColor" className="text-muted" />
          <circle
            cx="20" cy="20" r={radius}
            fill="none" strokeWidth="3" strokeLinecap="round" stroke="currentColor"
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
          <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl border border-border bg-card p-3 shadow-lg">
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
                        ? "bg-primary/80 text-white"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {i + 1}
                    {isFlagged && (
                      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                )
              })}
            </div>
            <div className="mt-3 flex items-center gap-3 border-t border-border pt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary/80" /> Answered</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Current</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Flagged</span>
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

  const [phase, setPhase] = useState<"setup" | "quiz">("setup")
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

  /* ── scroll refs ── */
  const focusAreasRef = useRef<HTMLDivElement>(null)
  const topicsRef = useRef<HTMLDivElement>(null)

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
    setDone(false)
    setReviewMode(false)
    setSelectedTopics([])
    setSelectedSubject(null)
    setPhase("setup")
  }

  function handleTimeout() {
    if (!answered && q) {
      setPicked("TIMEOUT")
      setAnswers((prev) => ({ ...prev, [index]: "TIMEOUT" }))
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
    // scroll to topics after state update
    setTimeout(() => {
      topicsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  if (loading) return <GenerationProgress />

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">Oops!</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{error}</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => { setError(""); if (phase === "setup") loadQuestions() }}>
            <RotateCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
          <Button variant="outline" onClick={() => router.push("/tests")}>
            Back to Tests
          </Button>
        </div>
      </div>
    )
  }

  if (phase === "setup") {
    const selectedMode = source === "syllabus" ? "syllabus" : "material"
    const canStartSyllabus = selectedSubject !== null && selectedTopics.length > 0

    return (
      <div className="mx-auto max-w-5xl pb-10">
        <div className="mb-8">
          <button
            onClick={() => router.push("/tests")}
            className="mb-5 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Tests
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Practice Studio
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {testName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Build a focused practice session. Choose your source, topics, difficulty and question count, then start.
              </p>
            </div>
            <div className="hidden rounded-xl border border-border bg-card px-4 py-3 text-right sm:block">
              <div className="text-xs text-muted-foreground">Session</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{count} questions</div>
            </div>
          </div>
        </div>

        <section>
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-foreground">What do you want to practice?</h2>
            <p className="mt-1 text-xs text-muted-foreground">Pick a mode to configure your session.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => {
                setSource("syllabus")
                setSelectedSubject(null)
                setSelectedTopics([])
                setTimeout(() => {
                  focusAreasRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                }, 100)
              }}
              className={`group relative rounded-xl border p-5 text-left transition active:scale-[0.98] ${
                selectedMode === "syllabus"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/30 hover:bg-accent/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-primary p-2.5 text-primary-foreground">
                  <BookOpen className="h-5 w-5" />
                </span>
                {selectedMode === "syllabus" && <CheckCircle2 className="h-5 w-5 text-primary" />}
              </div>
              <div className="mt-4 font-semibold text-card-foreground">Syllabus Practice</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Target exact subjects and topics from the syllabus.
              </p>
            </button>

            <button
              onClick={() => {
                setSource("material")
                setSelectedSubject(null)
                setSelectedTopics([])
              }}
              className={`group relative rounded-xl border p-5 text-left transition active:scale-[0.98] ${
                selectedMode === "material"
                  ? "border-violet-500 bg-violet-500/5"
                  : "border-border bg-card hover:border-violet-500/30 hover:bg-accent/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-violet-600 p-2.5 text-white">
                  <FolderOpen className="h-5 w-5" />
                </span>
                {selectedMode === "material" && <CheckCircle2 className="h-5 w-5 text-violet-500" />}
              </div>
              <div className="mt-4 font-semibold text-card-foreground">My Materials</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Practice from notes and documents you have uploaded.
              </p>
            </button>

            {syllabus && (
              <button
                onClick={() => router.push(`/tests/${encodeURIComponent(testName)}/partb`)}
                className="group rounded-xl border border-border bg-card p-5 text-left transition hover:border-foreground/20 hover:bg-accent/30 active:scale-[0.98]"
              >
                <span className="inline-flex rounded-lg bg-sky-600 p-2.5 text-white">
                  <PenLine className="h-5 w-5" />
                </span>
                <div className="mt-4 font-semibold text-card-foreground">Written Practice</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Translation and sentence formation with instant checking.
                </p>
              </button>
            )}

            {syllabus && (
              <button
                onClick={() => router.push(`/tests/${encodeURIComponent(testName)}/mock`)}
                className="group rounded-xl border border-border bg-card p-5 text-left transition hover:border-foreground/20 hover:bg-accent/30 active:scale-[0.98]"
              >
                <span className="inline-flex rounded-lg bg-amber-600 p-2.5 text-white">
                  <Timer className="h-5 w-5" />
                </span>
                <div className="mt-4 font-semibold text-card-foreground">Full Mock</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Simulate the complete exam under timed conditions.
                </p>
              </button>
            )}
          </div>
        </section>

        {source === "syllabus" && syllabus ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <section ref={focusAreasRef} className="rounded-xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-card-foreground">Focus areas</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Choose a subject and the topics you want to drill.</p>
                </div>
                <button
                  onClick={selectAllTopics}
                  disabled={!selectedSubject}
                  className="text-xs font-medium text-primary transition hover:text-primary/80 disabled:opacity-40"
                >
                  {selectedSubject && selectedTopics.length === selectedSubject.topics.length ? "Clear all" : "Select all"}
                </button>
              </div>

              <div className="mt-5 grid gap-2">
                {syllabus.subjects.map((subj) => {
                  const active = selectedSubject?.name === subj.name
                  return (
                    <button
                      key={subj.name}
                      onClick={() => {
                        setSelectedSubject(subj)
                        setSelectedTopics([])
                        setTimeout(() => {
                          topicsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                        }, 100)
                      }}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-foreground/15 hover:bg-accent/30"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className={`truncate text-sm font-medium ${active ? "text-primary" : "text-card-foreground"}`}>
                          {subj.name}
                        </div>
                        <div className="mt-1 text-[11px] text-muted-foreground">{subj.topics.length} topics</div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {subj.weightage}
                      </span>
                    </button>
                  )
                })}
              </div>

              {selectedSubject && (
                <div ref={topicsRef} className="mt-5 border-t border-border pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {selectedTopics.length} of {selectedSubject.topics.length} topics selected
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedSubject.topics.map((topic) => {
                      const active = selectedTopics.includes(topic)
                      return (
                        <button
                          key={topic}
                          onClick={() => toggleTopic(topic)}
                          className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-xs transition active:scale-[0.99] ${
                            active
                              ? "border-primary bg-primary/5 text-foreground"
                              : "border-border bg-background text-muted-foreground hover:bg-accent/30"
                          }`}
                        >
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                            active ? "border-primary bg-primary text-primary-foreground" : "border-border"
                          }`}>
                            {active && <Check className="h-3 w-3" />}
                          </span>
                          <span className="line-clamp-2">{topic}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>

            <aside className="h-fit rounded-xl border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-6">
              <h2 className="font-semibold text-card-foreground">Session settings</h2>
              <p className="mt-1 text-xs text-muted-foreground">Tune the challenge before you start.</p>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Difficulty</span>
                  <span className="text-xs font-semibold capitalize text-primary">{difficulty}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`rounded-xl border px-2 py-2.5 text-xs font-medium capitalize transition ${
                        difficulty === d
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:bg-accent/30"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Questions</span>
                  <span className="text-xs font-semibold text-primary">{count}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((n) => (
                    <button
                      key={n}
                      onClick={() => setCount(n)}
                      className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                        count === n
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border text-muted-foreground hover:bg-accent/30"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-background p-3.5">
                <div className="text-xs font-medium text-foreground">
                  Ready when you are
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  {selectedSubject
                    ? `${selectedTopics.length} topic${selectedTopics.length === 1 ? "" : "s"} selected from ${selectedSubject.name}.`
                    : "Select a subject to begin configuring your practice."}
                </p>
              </div>

              <Button
                onClick={loadQuestions}
                disabled={!canStartSyllabus}
                className="mt-5 h-11 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Start Practice
                <ArrowRight className="h-4 w-4" />
              </Button>
            </aside>
          </div>
        ) : (
          <section className="mt-8 rounded-xl border border-violet-500/20 bg-violet-500/5 p-6 sm:p-8">
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white">
                <FolderOpen className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">Practice from your materials</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Your uploaded material will be used to build a focused MCQ session. No topic-by-topic setup is needed.
              </p>

              <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-2 text-xs">
                {[
                  ["Difficulty", difficulty],
                  ["Questions", String(count)],
                  ["Source", "Uploads"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-border bg-card p-3">
                    <div className="text-[10px] text-muted-foreground">{label}</div>
                    <div className="mt-1 font-semibold capitalize text-foreground">{value}</div>
                  </div>
                ))}
              </div>

              <div className="mx-auto mt-5 flex max-w-md gap-2">
                {(["easy", "medium", "hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 rounded-xl border px-2 py-2 text-xs font-medium capitalize transition ${
                      difficulty === d
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent/30"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <Button
                onClick={loadQuestions}
                className="mt-5 h-11 w-full max-w-md gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Start Practice
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        )}
      </div>
    )
  }

  if (phase !== "quiz") return null

  const savedForTest = saved.filter((b) => b.test === testName)

  if (done && !reviewMode) {
    const pct = questions.length ? Math.round((correctCountRef.current / questions.length) * 100) : 0
    const correct = correctCountRef.current
    const wrong = Math.max(questions.length - correct - Object.values(answers).filter((a) => a === "TIMEOUT").length, 0)
    const timedOut = Object.values(answers).filter((a) => a === "TIMEOUT").length
    const isWin = pct >= 80
    const isAverage = pct >= 50 && pct < 80

    const title = isWin ? "Excellent work!" : isAverage ? "Good attempt!" : "Keep practicing!"
    const subtitle = isWin
      ? "You have a strong grasp of this material."
      : isAverage
      ? "You're getting there. A quick review can push this score higher."
      : "Don't worry. Use the review to find the gaps and try again."

    return (
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-start justify-center py-8 sm:py-12">
        {isWin && <Confetti />}

        <div className="w-full">
          <div className="text-center">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-xl ${
              isWin ? "bg-primary text-primary-foreground" : "bg-amber-500 text-white"
            }`}>
              <Trophy className="h-8 w-8" />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Test complete
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              {subtitle}
            </p>
          </div>

          <div className="mx-auto mt-7 max-w-2xl rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[8px] border-primary/10">
                <div className="absolute inset-0 rounded-full border-[8px] border-transparent border-t-primary border-r-primary -rotate-45" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{pct}%</div>
                  <div className="text-[10px] font-medium text-muted-foreground">SCORE</div>
                </div>
              </div>

              <div className="grid w-full grid-cols-3 gap-2">
                <div className="rounded-xl bg-primary p-3 text-center">
                  <div className="text-xl font-bold text-primary-foreground">{correct}</div>
                  <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-foreground/80">Correct</div>
                </div>
                <div className="rounded-xl bg-red-500 p-3 text-center">
                  <div className="text-xl font-bold text-white">{wrong}</div>
                  <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/80">Wrong</div>
                </div>
                <div className="rounded-xl bg-amber-500 p-3 text-center">
                  <div className="text-xl font-bold text-white">{timedOut}</div>
                  <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-white/80">Timed out</div>
                </div>
              </div>
            </div>

            {savedForTest.length > 0 && (
              <div className="mt-5 flex items-center justify-center gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <Bookmark className="h-3.5 w-3.5 text-primary" />
                {savedForTest.length} question{savedForTest.length > 1 ? "s" : ""} saved for later review
              </div>
            )}
          </div>

          <div className="mx-auto mt-5 max-w-2xl">
            {showShare ? (
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
                  <Share2 className="h-4 w-4 text-primary" />
                  Share your result
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  placeholder="Add a short message..."
                  className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <div className="mt-3 flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowShare(false)}>Cancel</Button>
                  <Button size="sm" onClick={shareToForum} disabled={sharing || !caption.trim()} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                    {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                    Post result
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-3">
                <Button
                  onClick={() => setReviewMode(true)}
                  className="h-11 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Eye className="h-4 w-4" />
                  Review answers
                </Button>
                <Button onClick={restart} variant="outline" className="h-11 gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Practice again
                </Button>
                <Button
                  onClick={openShare}
                  disabled={sharing || shared}
                  variant="outline"
                  className="h-11 gap-2"
                >
                  {shared ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
                  {shared ? "Shared" : "Share result"}
                </Button>
              </div>
            )}

            <div className="mt-3 text-center">
              <button
                onClick={() => router.push("/tests")}
                className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                Back to all tests →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (reviewMode) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Review Answers</h2>
          <Button variant="outline" size="sm" onClick={() => setReviewMode(false)} className="gap-2">
            <X className="h-4 w-4" /> Close
          </Button>
        </div>
        <div className="space-y-3">
          {questions.map((qItem, i) => {
            const userAns = answers[i]
            const correct = userAns === qItem.answer
            const timedOut = userAns === "TIMEOUT"
            return (
              <div key={i} className="rounded-xl border border-border bg-card p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {i + 1}. {qItem.question}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                      correct ? "bg-primary" : timedOut ? "bg-amber-500" : "bg-red-500"
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
                    if (isAns) cls = "font-medium text-primary"
                    else if (isUser && !isAns) cls = "font-medium text-red-500 line-through"
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/tests")} className="text-muted-foreground transition hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
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

      <div className="flex items-center justify-between">
        <CircularTimer duration={45} onTimeout={handleTimeout} keyReset={index} />
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFlag}
            className={`rounded-lg p-2 transition active:scale-90 ${
              isFlagged ? "bg-amber-500 text-white" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            title={isFlagged ? "Unflag question" : "Flag for review"}
          >
            <Flag className={`h-4 w-4 ${isFlagged ? "fill-current" : ""}`} />
          </button>
          <button
            onClick={toggleBookmark}
            className={`rounded-lg p-2 transition active:scale-90 ${
              isBookmarked ? "bg-yellow-500 text-white" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
            title={isBookmarked ? "Remove from saved" : "Save this question"}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Question {index + 1}
          </span>
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
            {index + 1} of {questions.length}
          </span>
        </div>
        <h1 className="text-lg font-semibold leading-snug tracking-[-0.01em] text-foreground sm:text-xl">
          {q.question}
        </h1>
      </div>

      <div className="space-y-2.5">
        {q.options.map((opt, j) => {
          const isPick = picked === opt
          const isAns = opt === q.answer
          let cls = "border-border bg-card text-foreground hover:border-primary/40"
          if (answered && isAns) cls = "border-primary bg-primary text-primary-foreground"
          else if (answered && isPick && !isAns) cls = "border-red-500 bg-red-500 text-white"
          else if (answered) cls = "border-border/40 bg-card/50 text-muted-foreground"
          return (
            <button
              key={j}
              onClick={() => pick(opt)}
              disabled={answered}
              className={`group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-all duration-150 active:scale-[0.995] ${cls} disabled:cursor-not-allowed sm:px-4 sm:py-3.5`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition ${
                answered && (isAns || isPick)
                  ? "bg-white/20 text-white"
                  : answered
                  ? "bg-muted text-muted-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
              }`}>
                {String.fromCharCode(65 + j)}
              </span>
              <span className="flex-1">{opt}</span>
              {answered && isAns && <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-foreground" />}
              {answered && isPick && !isAns && <XCircle className="h-5 w-5 shrink-0 text-white" />}
            </button>
          )
        })}
      </div>

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

      {answered && (
        <div
          className={`overflow-hidden rounded-xl border text-white ${
            isCorrect
              ? "border-primary bg-primary"
              : "border-red-500 bg-red-500"
          }`}
        >
          <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white">
                {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              </div>
              <div>
                <div className="font-semibold text-white">
                  {isCorrect ? "Correct answer" : picked === "TIMEOUT" ? "Time's up" : "Not quite"}
                </div>
                <div className="mt-0.5 text-xs text-white/80">
                  {isCorrect ? "Nice work. Keep the momentum going." : "Review the explanation before moving on."}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExpl(!showExpl)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                Explanation
                <ChevronDown className={`h-4 w-4 transition-transform ${showExpl ? "rotate-180" : ""}`} />
              </button>
              <Button onClick={next} className="gap-2 bg-white text-black hover:bg-white/90">
                {index + 1 >= questions.length ? "Finish" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showExpl && (
            <div className="border-t border-white/20 px-3.5 py-3 text-xs leading-relaxed text-white/90 sm:px-4 sm:py-3.5">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-white">
                Why this is the answer
              </span>
              {q.explanation}
            </div>
          )}
        </div>
      )}

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