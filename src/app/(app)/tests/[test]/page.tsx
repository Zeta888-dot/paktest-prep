"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { loadSettings } from "@/lib/settings"
import {
  X,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
  ChevronDown,
} from "lucide-react"

type Question = { question: string; options: string[]; answer: string; explanation: string }

export default function TestPracticePage() {
  const params = useParams<{ test: string }>()
  const router = useRouter()
  const testName = decodeURIComponent(params.test ?? "")

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<"syllabus" | "material">("syllabus")
  const [count, setCount] = useState(5)
  const [ready, setReady] = useState(false)

  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)
  const [showExpl, setShowExpl] = useState(false)
  const submitted = useRef(false)

  useEffect(() => {
    const s = loadSettings()
    setSource(s.defaultSource)
    setCount(s.questionsPerTest)
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    async function load() {
      setLoading(true)
      setIndex(0)
      setPicked(null)
      setCorrectCount(0)
      setDone(false)
      setShowExpl(false)
      submitted.current = false
      try {
        const url = source === "material" ? "/api/generate-rag" : "/api/generate"
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ test: testName, topic: testName, count }),
        })
        const data = await res.json()
        setQuestions(data.questions ?? [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [testName, source, count, ready])

  const q = questions[index]
  const answered = picked !== null
  const isCorrect = picked !== null && q !== undefined && picked === q.answer

  function pick(opt: string) {
    if (answered) return
    setPicked(opt)
    setShowExpl(false)
    if (opt === q.answer) setCorrectCount((c) => c + 1)
  }

  function next() {
    if (index + 1 >= questions.length) {
      setDone(true)
      if (!submitted.current) {
        submitted.current = true
        fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ testName, source, correct: correctCount, total: questions.length }),
        })
      }
    } else {
      setIndex(index + 1)
      setPicked(null)
      setShowExpl(false)
    }
  }

  function restart() {
    setIndex(0)
    setPicked(null)
    setCorrectCount(0)
    setDone(false)
    setShowExpl(false)
    submitted.current = false
  }

  if (loading) {
    return <div className="text-white/50">Generating MCQs for {testName}... Please wait.</div>
  }

  if (done) {
    const pct = Math.round((correctCount / questions.length) * 100)
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <Trophy className="h-14 w-14 text-yellow-400" />
        <h1 className="mt-6 text-3xl font-semibold text-white">Test Complete!</h1>
        <p className="mt-2 text-white/50">
          You scored {correctCount}/{questions.length} ({pct}%)
        </p>
        <div className="mt-8 flex gap-3">
          <Button onClick={restart} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Practice Again
          </Button>
          <Button variant="outline" onClick={() => router.push("/tests")}>
            Back to Tests
          </Button>
        </div>
      </div>
    )
  }

  if (!q) return <div className="text-white/50">No questions.</div>

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/tests")} className="text-white/40 transition hover:text-white">
          <X className="h-5 w-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-white/50">
          {index + 1}/{questions.length}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSource("syllabus")}
          className={`rounded-full px-3 py-1 text-xs transition ${
            source === "syllabus" ? "bg-white text-black" : "border border-white/15 text-white/60 hover:bg-white/5"
          }`}
        >
          From Syllabus
        </button>
        <button
          onClick={() => setSource("material")}
          className={`rounded-full px-3 py-1 text-xs transition ${
            source === "material" ? "bg-white text-black" : "border border-white/15 text-white/60 hover:bg-white/5"
          }`}
        >
          From My Material
        </button>
      </div>

      <h1 className="text-xl font-semibold text-white">{q.question}</h1>

      <div className="space-y-3">
        {q.options.map((opt, j) => {
          const isPick = picked === opt
          const isAns = opt === q.answer
          let cls = "border-white/10 bg-white/[0.03] text-white hover:border-white/30"
          if (answered && isAns) cls = "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
          else if (answered && isPick && !isAns) cls = "border-red-400/50 bg-red-400/10 text-red-300"
          else if (answered) cls = "border-white/5 bg-white/[0.02] text-white/30"
          return (
            <button
              key={j}
              onClick={() => pick(opt)}
              disabled={answered}
              className={`w-full rounded-xl border px-5 py-3 text-left text-sm transition ${cls} disabled:cursor-not-allowed`}
            >
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExpl(!showExpl)}
                className="flex items-center gap-1 text-xs text-white/60 transition hover:text-white"
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
            <div className="mt-3 border-t border-white/10 pt-3 text-sm text-white/60">{q.explanation}</div>
          )}
        </div>
      )}
    </div>
  )
}