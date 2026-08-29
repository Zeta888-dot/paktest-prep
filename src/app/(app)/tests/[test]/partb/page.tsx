"use client"

import { useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Confetti } from "@/components/ui/confetti"
import { GenerationProgress } from "@/components/ui/generation-progress"
import {
  ChevronLeft,
  Languages,
  PenLine,
  ArrowRight,
  Trophy,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react"

type SubQ = { question: string; referenceUrdu: string; referenceRoman: string }
type Section = "english-translation" | "urdu-formation"

function normalize(s: string) {
  return s.toLowerCase().replace(/[.,!?;:"'۔،؟؛]/g, "").replace(/\s+/g, " ").trim()
}

function similarity(a: string, b: string) {
  const wordsA = new Set(normalize(a).split(" ").filter(Boolean))
  const wordsB = normalize(b).split(" ").filter(Boolean)
  if (wordsA.size === 0 || wordsB.length === 0) return 0
  let hit = 0
  for (const w of wordsB) if (wordsA.has(w)) hit++
  return hit / wordsB.length
}

function evaluateLocal(userAnswer: string, q: SubQ) {
  const s = Math.max(similarity(userAnswer, q.referenceRoman), similarity(userAnswer, q.referenceUrdu))
  if (s >= 0.7) return 2
  if (s >= 0.4) return 1
  return 0
}

export default function PartBPage() {
  const params = useParams<{ test: string }>()
  const router = useRouter()
  const testName = decodeURIComponent(params.test ?? "")

  const [phase, setPhase] = useState<"section" | "quiz">("section")
  const [section, setSection] = useState<Section>("english-translation")
  const [questions, setQuestions] = useState<SubQ[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [result, setResult] = useState<{ score: number; feedback: string } | null>(null)
  const [scores, setScores] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const startedAtRef = useRef<number>(0)
  const submitted = useRef(false)

  const q = questions[index]

  async function start(sec: Section) {
    setSection(sec)
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/generate-subjective", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sec, count: 5 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate questions")
      setQuestions(data.questions ?? [])
      setPhase("quiz")
      setIndex(0)
      setAnswer("")
      setResult(null)
      setScores([])
      setDone(false)
      submitted.current = false
      startedAtRef.current = Date.now()
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function submit() {
    if (!answer.trim() || !q || result) return
    const score = evaluateLocal(answer, q)
    setResult({
      score,
      feedback:
        score === 2
          ? "Shabash! Your answer is correct."
          : score === 1
          ? "Partially correct. Compare your answer with the reference."
          : "Incorrect. Study the reference answer carefully.",
    })
    setScores((prev) => [...prev, score])
  }

  function next() {
    if (index + 1 >= questions.length) {
      setDone(true)
      if (!submitted.current) {
        submitted.current = true
        const total = scores.reduce((a, b) => a + b, 0)
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            testName,
            source: "subjective",
            correct: total,
            total: 10,
            duration: startedAtRef.current
              ? Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000))
              : null,
          }),
        })
      }
    } else {
      setIndex(index + 1)
      setAnswer("")
      setResult(null)
    }
  }

  // Loading
  if (loading) {
    return (
      <GenerationProgress
        title="Preparing Part B"
        steps={["Picking sentences", "Finalizing reference answers", "Almost there"]}
      />
    )
  }

  // Error
  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-up">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">Oops!</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{error}</p>
        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => {
              setError("")
              start(section)
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
          <Button variant="outline" onClick={() => router.push("/tests")}>
            Back to Tests
          </Button>
        </div>
      </div>
    )
  }

  // Done
  if (done) {
    const total = scores.reduce((a, b) => a + b, 0)
    const pct = Math.round((total / 10) * 100)
    const passed = pct >= 40
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center animate-fade-up">
        {passed && <Confetti />}
        <Trophy className="h-14 w-14 animate-bounce-in text-yellow-400" />
        <h1 className="mt-6 text-3xl font-semibold text-foreground">Part B Complete!</h1>
        <p className="mt-2 text-muted-foreground">You scored {total}/10 ({pct}%)</p>
        <span
          className={`mt-3 rounded-full border px-3 py-1 text-xs font-medium ${
            passed
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
              : "border-red-400/20 bg-red-400/10 text-red-400"
          }`}
        >
          {passed ? "Part Qualified (40%+)" : "Below qualifying marks (40%)"}
        </span>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={() => start(section)} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Practice Again
          </Button>
          <Button variant="outline" onClick={() => setPhase("section")}>
            Change Section
          </Button>
          <Button variant="outline" onClick={() => router.push("/tests")}>
            Back to Tests
          </Button>
        </div>
      </div>
    )
  }

  // Section Selection
  if (phase === "section") {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/tests/${encodeURIComponent(testName)}`)}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{testName}: Part B</h1>
            <p className="mt-1 text-muted-foreground">Select a subjective section (10 marks each)</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => start("english-translation")}
            className="group rounded-xl border border-border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent active:scale-[0.98]"
          >
            <span className="inline-block rounded-lg bg-blue-400/10 p-2 text-blue-400">
              <Languages className="h-5 w-5" />
            </span>
            <div className="mt-3 font-medium text-card-foreground">English Translation</div>
            <p className="mt-1 text-sm text-muted-foreground">Translate English sentences into Urdu.</p>
          </button>
          <button
            onClick={() => start("urdu-formation")}
            className="group rounded-xl border border-border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-accent active:scale-[0.98]"
          >
            <span className="inline-block rounded-lg bg-emerald-400/10 p-2 text-emerald-400">
              <PenLine className="h-5 w-5" />
            </span>
            <div className="mt-3 font-medium text-card-foreground">Urdu Sentence Formation</div>
            <p className="mt-1 text-sm text-muted-foreground">Form correct sentences from the given words.</p>
          </button>
        </div>
      </div>
    )
  }

  // Quiz
  if (!q) return null

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
      <div className="flex items-center gap-4">
        <button onClick={() => setPhase("section")} className="text-muted-foreground transition hover:text-foreground">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${((index + (result ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {index + 1}/{questions.length}
        </span>
      </div>

      <div className="text-xs text-muted-foreground">
        <span className="rounded-full border border-border bg-muted px-2 py-0.5">
          {section === "english-translation" ? "English to Urdu Translation" : "Urdu Sentence Formation"} · 2 marks
        </span>
      </div>

      <h1 className="text-xl font-semibold text-foreground" dir="auto">
        {q.question}
      </h1>

      {!result ? (
        <div className="space-y-3">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
            dir="auto"
            placeholder={
              section === "english-translation"
                ? "Write your translation in Urdu script or Roman Urdu..."
                : "Write your sentence in Urdu script or Roman Urdu..."
            }
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <Button onClick={submit} disabled={!answer.trim()} className="w-full gap-2">
            Submit Answer <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`rounded-xl border p-4 text-white ${
            result.score === 2
              ? "animate-bounce-in border-emerald-500 bg-emerald-500"
              : result.score === 1
              ? "animate-bounce-in border-amber-500 bg-amber-500"
              : "animate-shake border-red-500 bg-red-500"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {result.score === 2 ? (
                <CheckCircle2 className="h-6 w-6 shrink-0 text-white" />
              ) : result.score === 1 ? (
                <AlertCircle className="h-6 w-6 shrink-0 text-white" />
              ) : (
                <XCircle className="h-6 w-6 shrink-0 text-white" />
              )}
              <span className="font-medium text-white">{result.score}/2 marks</span>
            </div>
            <Button onClick={next} className="gap-2 bg-white text-black hover:bg-white/90">
              {index + 1 >= questions.length ? "Finish" : "Next"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-3 text-sm text-white/90">{result.feedback}</p>
          <div className="mt-3 space-y-1 border-t border-white/20 pt-3 text-sm">
            <span className="text-xs text-white/80">Reference answers:</span>
            <p className="text-white" dir="rtl">
              {q.referenceUrdu}
            </p>
            <p className="text-white/90">{q.referenceRoman}</p>
          </div>
        </div>
      )}
    </div>
  )
}