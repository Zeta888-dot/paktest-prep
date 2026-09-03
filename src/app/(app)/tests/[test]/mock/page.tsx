"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Confetti } from "@/components/ui/confetti"
import { GenerationProgress } from "@/components/ui/generation-progress"
import {
  ChevronLeft,
  ArrowRight,
  Timer,
  Trophy,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Flag,
} from "lucide-react"

type MockMCQ = { subject: string; question: string; options: string[]; answer: string; explanation: string }
type SubQ = { question: string; referenceUrdu: string; referenceRoman: string }
type BLog = { section: string; question: string; referenceUrdu: string; referenceRoman: string; answer: string; score: number }

const PART_A_TIME = 80 * 60
const PART_B_TIME = 15 * 60

const SUBJECT_PLAN = [
  { subject: "English", count: 15 },
  { subject: "Urdu", count: 15 },
  { subject: "Islamiyat", count: 15 },
  { subject: "General Knowledge (incl. Pak Studies)", count: 20 },
  { subject: "Mathematics", count: 15 },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

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

function fmt(sec: number) {
  const m = Math.floor(Math.max(0, sec) / 60)
  const s = Math.max(0, sec) % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default function MockPage() {
  const params = useParams<{ test: string }>()
  const router = useRouter()
  const testName = decodeURIComponent(params.test ?? "")

  const [phase, setPhase] = useState<"intro" | "partA" | "partB" | "result">("intro")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stage, setStage] = useState(0)

  const [mcqs, setMcqs] = useState<MockMCQ[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [marked, setMarked] = useState<number[]>([])
  const [current, setCurrent] = useState(0)
  const [timeA, setTimeA] = useState(PART_A_TIME)
  const [showConfirm, setShowConfirm] = useState(false)

  const [translations, setTranslations] = useState<SubQ[]>([])
  const [formations, setFormations] = useState<SubQ[]>([])
  const [bIndex, setBIndex] = useState(0)
  const [bAnswer, setBAnswer] = useState("")
  const [bResult, setBResult] = useState<{ score: number } | null>(null)
  const [bLog, setBLog] = useState<BLog[]>([])
  const [timeB, setTimeB] = useState(PART_B_TIME)

  const startedAtRef = useRef(0)
  const submittedRef = useRef(false)

  const bQuestions = [
    ...translations.map((t) => ({ ...t, section: "English to Urdu Translation" })),
    ...formations.map((f) => ({ ...f, section: "Urdu Sentence Formation" })),
  ]
  const bq = bQuestions[bIndex]

  useEffect(() => {
    if (phase === "partA") {
      const t = setInterval(() => setTimeA((p) => p - 1), 1000)
      return () => clearInterval(t)
    }
    if (phase === "partB") {
      const t = setInterval(() => setTimeB((p) => p - 1), 1000)
      return () => clearInterval(t)
    }
  }, [phase])

  useEffect(() => {
    if (phase === "partA" && timeA <= 0) submitPartA()
  }, [timeA, phase])

  useEffect(() => {
    if (phase === "partB" && timeB <= 0) finishMock()
  }, [timeB, phase])

  async function start() {
    setLoading(true)
    setError("")
    setStage(0)
    try {
      const all: MockMCQ[] = []
      for (let i = 0; i < SUBJECT_PLAN.length; i++) {
        setStage(i)
        const res = await fetch("/api/generate-mock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ part: "a", subject: SUBJECT_PLAN[i].subject, count: SUBJECT_PLAN[i].count }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || `Failed to generate ${SUBJECT_PLAN[i].subject}`)
        all.push(...(data.mcqs ?? []))
      }
      setMcqs(shuffle(all))
      setAnswers({})
      setMarked([])
      setCurrent(0)
      setTimeA(PART_A_TIME)
      setShowConfirm(false)
      submittedRef.current = false
      startedAtRef.current = Date.now()
      setPhase("partA")
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function submitPartA() {
    setShowConfirm(false)
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/generate-mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part: "b" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load Part B")
      setTranslations(data.translations ?? [])
      setFormations(data.formations ?? [])
      setBIndex(0)
      setBAnswer("")
      setBResult(null)
      setBLog([])
      setTimeB(PART_B_TIME)
      setPhase("partB")
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  function bSubmit() {
    if (!bq || !bAnswer.trim() || bResult) return
    const score = evaluateLocal(bAnswer, bq)
    setBResult({ score })
    setBLog((prev) => [...prev, { ...bq, answer: bAnswer, score }])
  }

  function bNext() {
    if (bIndex + 1 >= bQuestions.length) finishMock()
    else {
      setBIndex(bIndex + 1)
      setBAnswer("")
      setBResult(null)
    }
  }

  const partACorrect = mcqs.filter((q, i) => answers[i] === q.answer).length
  const partAMarks = partACorrect * 4
  const partBMarks = bLog.reduce((a, b) => a + b.score, 0)
  const totalMarks = partAMarks + partBMarks
  const passedA = partAMarks >= 32
  const passedB = partBMarks >= 8
  const passedOverall = totalMarks >= 40 && passedA && passedB

  function finishMock() {
    setPhase("result")
    if (!submittedRef.current) {
      submittedRef.current = true
      fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testName,
          source: "mock",
          correct: totalMarks,
          total: 100,
          duration: startedAtRef.current
            ? Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000))
            : null,
        }),
      })
    }
  }

  const bySubject: Record<string, { correct: number; total: number }> = {}
  mcqs.forEach((q, i) => {
    if (!bySubject[q.subject]) bySubject[q.subject] = { correct: 0, total: 0 }
    bySubject[q.subject].total++
    if (answers[i] === q.answer) bySubject[q.subject].correct++
  })

  if (loading) {
    return (
      <GenerationProgress
        title="Preparing your exam"
        steps={[
          "English paper (15 MCQs)",
          "Urdu paper (15 MCQs)",
          "Islamiyat paper (15 MCQs)",
          "General Knowledge paper (20 MCQs)",
          "Mathematics paper (15 MCQs)",
        ]}
        currentStep={stage}
      />
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-up">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-lg font-semibold text-foreground">Oops!</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{error}</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => { setError(""); if (phase === "partA") submitPartA(); else start() }}>
            <RotateCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
          <Button variant="outline" onClick={() => router.push("/tests")}>Back to Tests</Button>
        </div>
      </div>
    )
  }

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push(`/tests/${encodeURIComponent(testName)}`)} className="text-muted-foreground hover:text-foreground transition">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{testName}: Full Mock Test</h1>
            <p className="mt-1 text-muted-foreground">Real exam simulation, 100 marks</p>
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Part A: MCQs (15+15+15+20+15)</span>
            <span className="font-medium text-card-foreground">80 marks · 80 min</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Part B: Translation + Formation</span>
            <span className="font-medium text-card-foreground">20 marks · 15 min</span>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">Qualifying marks</span>
            <span className="font-medium text-amber-400">40% per part</span>
          </div>
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-muted-foreground">
          Timer khatam hote hi part auto-submit ho jayega. Part A submit karne ke baad hi Part B khulega, bilkul real exam jaisa.
        </div>

        <Button onClick={start} className="w-full gap-2">
          Start Mock Test <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (phase === "partA" && mcqs.length > 0) {
    const q = mcqs[current]
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Part A: MCQs
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${
              timeA < 60
                ? "border-red-400/30 bg-red-400/10 text-red-400"
                : timeA < 300
                ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                : "border-border bg-muted text-foreground"
            }`}
          >
            <Timer className="h-4 w-4" /> {fmt(timeA)}
          </span>
        </div>

        <div className="grid grid-cols-10 gap-1">
          {mcqs.map((_, i) => {
            const isAnswered = answers[i] !== undefined
            const isMarked = marked.includes(i)
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-7 rounded text-[10px] font-medium transition ${
                  isMarked
                    ? "bg-amber-500 text-white"
                    : isAnswered
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                } ${i === current ? "ring-2 ring-primary" : ""}`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {q.subject}
          </span>
          <h1
            className="mt-3 text-lg font-semibold text-foreground"
            dangerouslySetInnerHTML={{ __html: q.question }}
          />
          <div className="mt-4 space-y-2">
            {q.options.map((opt, j) => (
              <button
                key={j}
                onClick={() => setAnswers((prev) => ({ ...prev, [current]: opt }))}
                className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition active:scale-[0.98] ${
                  answers[current] === opt
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                <span className="mr-2 font-medium opacity-70">{String.fromCharCode(65 + j)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <button
            onClick={() =>
              setMarked((prev) => (prev.includes(current) ? prev.filter((m) => m !== current) : [...prev, current]))
            }
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
              marked.includes(current)
                ? "bg-amber-500 text-white"
                : "text-muted-foreground hover:bg-accent"
            }`}
          >
            <Flag className="h-3.5 w-3.5" /> {marked.includes(current) ? "Marked" : "Mark for Review"}
          </button>
          <Button variant="outline" size="sm" onClick={() => setCurrent(Math.min(mcqs.length - 1, current + 1))} disabled={current === mcqs.length - 1}>
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {showConfirm ? (
          <div className="space-y-3 rounded-xl border border-border bg-card p-4 text-sm">
            <p className="text-card-foreground">
              {Object.keys(answers).length}/{mcqs.length} answered. Submit Part A and move to Part B?
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={submitPartA}>Yes, Submit</Button>
              <Button size="sm" variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setShowConfirm(true)} className="w-full">
            Submit Part A
          </Button>
        )}
      </div>
    )
  }

  if (phase === "partB" && bq) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Part B: {bIndex + 1}/{bQuestions.length}
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${
              timeB < 60
                ? "border-red-400/30 bg-red-400/10 text-red-400"
                : timeB < 300
                ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                : "border-border bg-muted text-foreground"
            }`}
          >
            <Timer className="h-4 w-4" /> {fmt(timeB)}
          </span>
        </div>

        <div className="text-xs text-muted-foreground">
          <span className="rounded-full border border-border bg-muted px-2 py-0.5">{bq.section} · 2 marks</span>
        </div>

        <h1 className="text-xl font-semibold text-foreground" dir="auto">{bq.question}</h1>

        {!bResult ? (
          <div className="space-y-3">
            <textarea
              value={bAnswer}
              onChange={(e) => setBAnswer(e.target.value)}
              rows={4}
              dir="auto"
              placeholder="Write your answer in Urdu script or Roman Urdu..."
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Button onClick={bSubmit} disabled={!bAnswer.trim()} className="w-full gap-2">
              Submit Answer <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className={`rounded-xl border p-4 text-white ${
              bResult.score === 2
                ? "animate-bounce-in border-emerald-500 bg-emerald-500"
                : bResult.score === 1
                ? "animate-bounce-in border-amber-500 bg-amber-500"
                : "animate-shake border-red-500 bg-red-500"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {bResult.score === 2 ? (
                  <CheckCircle2 className="h-6 w-6 text-white" />
                ) : bResult.score === 1 ? (
                  <AlertCircle className="h-6 w-6 text-white" />
                ) : (
                  <XCircle className="h-6 w-6 text-white" />
                )}
                <span className="font-medium text-white">{bResult.score}/2 marks</span>
              </div>
              <Button onClick={bNext} className="gap-2 bg-white text-black hover:bg-white/90">
                {bIndex + 1 >= bQuestions.length ? "Finish" : "Next"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 space-y-1 border-t border-white/20 pt-3 text-sm">
              <span className="text-xs text-white/80">Reference answers:</span>
              <p className="text-white" dir="rtl">{bq.referenceUrdu}</p>
              <p className="text-white/90">{bq.referenceRoman}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (phase === "result") {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-fade-up">
        <div className="flex flex-col items-center py-8 text-center">
          {passedOverall && <Confetti />}
          <Trophy className="h-14 w-14 text-yellow-400" />
          <h1 className="mt-6 text-3xl font-semibold text-foreground">Mock Test Complete!</h1>
          <p className="mt-2 text-muted-foreground">Total: {totalMarks}/100</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${passedA ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400" : "border-red-400/20 bg-red-400/10 text-red-400"}`}>
              Part A: {partAMarks}/80
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${passedB ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400" : "border-red-400/20 bg-red-400/10 text-red-400"}`}>
              Part B: {partBMarks}/20
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${passedOverall ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400" : "border-red-400/20 bg-red-400/10 text-red-400"}`}>
              {passedOverall ? "QUALIFIED (40%+)" : "NOT QUALIFIED"}
            </span>
          </div>
        </div>

        <section className="space-y-3 rounded-xl border border-border bg-card p-5">
          <h2 className="font-medium text-card-foreground">Subject-wise Part A</h2>
          {Object.entries(bySubject).map(([subj, v]) => {
            const pct = Math.round((v.correct / v.total) * 100)
            return (
              <div key={subj}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-card-foreground">{subj}</span>
                  <span className="text-muted-foreground">{v.correct}/{v.total}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-400" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </section>

        <section className="space-y-3">
          <h2 className="font-medium text-foreground">Part A Review</h2>
          {mcqs.map((q, i) => {
            const userAns = answers[i]
            const correct = userAns === q.answer
            return (
              <div key={i} className={`rounded-xl border p-4 ${correct ? "border-emerald-400/30 bg-emerald-400/5" : "border-red-400/30 bg-red-400/5"}`}>
                <div
                  className="text-sm font-medium text-foreground"
                  dangerouslySetInnerHTML={{ __html: `${i + 1}. ${q.question}` }}
                />
                <div className="mt-2 space-y-0.5 text-xs">
                  <p className={correct ? "text-emerald-400" : "text-red-400"}>
                    Your answer: {userAns ?? "Not answered"}
                  </p>
                  {!correct && <p className="text-emerald-400">Correct: {q.answer}</p>}
                  <p className="text-muted-foreground">{q.explanation}</p>
                </div>
              </div>
            )
          })}
        </section>

        <section className="space-y-3">
          <h2 className="font-medium text-foreground">Part B Review</h2>
          {bLog.map((b, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <div className="text-xs text-muted-foreground">{b.section} · {b.score}/2</div>
              <p className="mt-1 text-sm font-medium text-foreground" dir="auto">{b.question}</p>
              <p className="mt-2 text-xs text-muted-foreground">Your answer: <span dir="auto">{b.answer}</span></p>
              <p className="mt-1 text-xs text-foreground" dir="rtl">{b.referenceUrdu}</p>
              <p className="text-xs text-muted-foreground">{b.referenceRoman}</p>
            </div>
          ))}
        </section>

        <div className="flex justify-center gap-3 pb-8">
          <Button onClick={() => setPhase("intro")} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Take Again
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>Dashboard</Button>
        </div>
      </div>
    )
  }

  return null
}