"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { loadSettings } from "@/lib/settings"

type Question = {
  question: string
  options: string[]
  answer: string
  explanation: string
}

export default function TestPracticePage() {
  const params = useParams<{ test: string }>()
  const testName = decodeURIComponent(params.test ?? "")

  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Record<number, string>>({})
  const [source, setSource] = useState<"syllabus" | "material">("syllabus")
  const [count, setCount] = useState(5)
  const [ready, setReady] = useState(false)
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
      setSelected({})
      try {
        const url = source === "material" ? "/api/generate-rag" : "/api/generate"
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ test: testName, topic: testName, count }),
        })
        const data = await res.json()
        setQuestions(data.questions ?? [])
        submitted.current = false
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [testName, source, count, ready])

  useEffect(() => {
    if (questions.length === 0) return
    if (Object.keys(selected).length !== questions.length) return
    if (submitted.current) return
    submitted.current = true
    const correct = questions.filter((q, i) => selected[i] === q.answer).length
    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testName, source, correct, total: questions.length }),
    })
  }, [selected, questions, source, testName])

  if (loading) {
    return (
      <div className="text-muted-foreground">
        Generating MCQs for {testName}... Please wait.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{testName}</h1>
        <p className="mt-1 text-muted-foreground">{questions.length} questions generated</p>
        <div className="mt-4 flex gap-2">
          <Button variant={source === "syllabus" ? "default" : "outline"} onClick={() => setSource("syllabus")}>
            From Syllabus
          </Button>
          <Button variant={source === "material" ? "default" : "outline"} onClick={() => setSource("material")}>
            From My Material
          </Button>
        </div>
      </div>

      {questions.map((q, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-base font-medium text-card-foreground">
            {i + 1}. {q.question}
          </h2>
          <div className="space-y-2">
            {q.options.map((opt, j) => {
              const isSelected = selected[i] === opt
              const isCorrect = selected[i] && opt === q.answer
              const showWrong = isSelected && !isCorrect
              return (
                <button
                  key={j}
                  disabled={!!selected[i]}
                  onClick={() => setSelected({ ...selected, [i]: opt })}
                  className={`w-full rounded-md border px-4 py-2 text-left text-sm transition-colors
                    ${isCorrect ? "border-primary bg-primary/10 text-primary" : ""}
                    ${showWrong ? "border-destructive bg-destructive/10 text-destructive" : ""}
                    ${!isSelected && !isCorrect ? "border-border text-card-foreground hover:bg-accent" : ""}
                    disabled:cursor-not-allowed`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
          {selected[i] && (
            <div className="mt-4 rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">
              <span className="text-foreground font-medium">Explanation: </span>
              {q.explanation}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}