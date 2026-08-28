"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { loadSettings } from "@/lib/settings"
import { loadBookmarks, toggleSaved, type SavedQuestion } from "@/lib/bookmarks"
import { getSyllabus, type Subject } from "@/lib/syllabus"
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
} from "lucide-react"

type Question = {
  question: string
  options: string[]
  answer: string
  explanation: string
}

function TimerBar({ duration, onTimeout, keyReset }: { duration: number; onTimeout: () => void; keyReset: number }) {
  const [left, setLeft] = useState(duration)

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

  const pct = (left / duration) * 100
  const barColor = pct > 50 ? "bg-emerald-400" : pct > 20 ? "bg-amber-400" : "bg-red-400"

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Timer className="h-3 w-3" /> {left}s
        </span>
        <span>Auto-skip in {left}s</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
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
          title: `${testName} Practice — ${pct}%`,
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

  // ─── Loading ───
  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
        <div className="flex items-center gap-4">
          <div className="h-5 w-5 animate-pulse rounded bg-muted" />
          <div className="h-2 flex-1 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  // ─── Error ──
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

  // ─── PHASE: Source Selection ───
  if (phase === "source") {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{testName}</h1>
          <p className="mt-2 text-muted-foreground">Questions kahan se generate karein?</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => {
              setSource("syllabus")
              if (syllabus) setPhase("subject")
              else loadQuestions()
            }}
            className="group rounded-xl border border-border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent"
          >
            <span className="inline-block rounded-lg bg-blue-400/10 p-2 text-blue-400">
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="mt-3 font-medium text-card-foreground">From Syllabus</div>
            <p className="mt-1 text-sm text-muted-foreground">Official syllabus ki base pe AI-generated MCQs.</p>
          </button>
          <button
            onClick={() => {
              setSource("material")
              loadQuestions()
            }}
            className="group rounded-xl border border-border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent"
          >
            <span className="inline-block rounded-lg bg-purple-400/10 p-2 text-purple-400">
              <FolderOpen className="h-5 w-5" />
            </span>
            <div className="mt-3 font-medium text-card-foreground">From My Material</div>
            <p className="mt-1 text-sm text-muted-foreground">Is test ke liye upload kiye gaye notes se MCQs.</p>
          </button>
        </div>
      </div>
    )
  }

  // ─── PHASE: Subject Selection ───
  if (phase === "subject" && syllabus) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <button onClick={() => setPhase("source")} className="text-muted-foreground hover:text-foreground transition">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{testName}</h1>
            <p className="mt-1 text-muted-foreground">Subject select karein</p>
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
              className="flex items-center justify-between rounded-xl border border-border bg-card p-5 text-left transition hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent"
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

  // ─── PHASE: Topic Selection ───
  if (phase === "topic" && selectedSubject) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <button onClick={() => setPhase("subject")} className="text-muted-foreground hover:text-foreground transition">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{selectedSubject.name}</h1>
            <p className="mt-1 text-muted-foreground">Topics aur difficulty select karein</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(["easy", "medium", "hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
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
          className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
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
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
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

        <Button
          onClick={loadQuestions}
          disabled={selectedTopics.length === 0}
          className="w-full gap-2"
        >
          Generate MCQs ({selectedTopics.length} topic{selectedTopics.length > 1 ? "s" : ""}){" "}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // ─── Quiz not started yet ───
  if (phase !== "quiz") return null

  const savedForTest = saved.filter((b) => b.test === testName)

  // ─── Done Screen ───
  if (done && !reviewMode) {
    const pct = questions.length ? Math.round((correctCountRef.current / questions.length) * 100) : 0
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center animate-fade-up">
        <Trophy className="h-14 w-14 text-yellow-400" />
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

  // ─── Review Mode ───
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

  // ─── Quiz UI ───
  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
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
        <span className="text-sm text-muted-foreground">
          {index + 1}/{questions.length}
        </span>
      </div>

      <TimerBar duration={45} onTimeout={handleTimeout} keyReset={index} />

      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">{q.question}</h1>
        <button
          onClick={toggleBookmark}
          className={`shrink-0 rounded-lg p-2 transition ${
            isBookmarked ? "bg-yellow-400/10 text-yellow-400" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
          title={isBookmarked ? "Remove from saved" : "Save this question"}
        >
          <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="space-y-3">
        {q.options.map((opt, j) => {
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

      {!answered && (
        <p className="text-xs text-muted-foreground">Tip: Press 1-4 to answer, Enter for next</p>
      )}

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
              <Button onClick={next} className="gap-2">
                {index + 1 >= questions.length ? "Finish" : "Next"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {showExpl && (
            <div className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">{q.explanation}</div>
          )}
        </div>
      )}
    </div>
  )
}