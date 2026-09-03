"use client"

import { useEffect, useState } from "react"
import { BrainCircuit, Check, Lightbulb } from "lucide-react"

const DEFAULT_FACTS = [
  "Did you know? Aspirants who practice 20+ questions daily are 3x more likely to clear their test.",
  "Did you know? PakTest Prep has generated 50,000+ practice MCQs for aspirants across Pakistan.",
  "Did you know? Reviewing your wrong answers boosts memory more than repeating correct ones.",
  "Did you know? The real KPK Police Constable Part A has exactly 80 MCQs, just like this mock.",
  "Did you know? Students who attempt full mock tests score 15% higher in the real exam on average.",
  "Did you know? A 5-day study streak doubles your chances of finishing the syllabus on time.",
]

export function GenerationProgress({
  title = "Generating your MCQs",
  steps = [
    "Reading your selected topics",
    "Crafting fresh questions",
    "Verifying correct answers",
    "Polishing explanations",
    "Almost there",
  ],
  currentStep,
  facts,
}: {
  title?: string
  steps?: string[]
  currentStep?: number
  facts?: string[]
}) {
  const [auto, setAuto] = useState(0)
  const [factIndex, setFactIndex] = useState(0)
  const list = facts ?? DEFAULT_FACTS

  useEffect(() => {
    if (currentStep !== undefined) return
    const t = setInterval(() => setAuto((p) => Math.min(p + 1, steps.length - 1)), 1200)
    return () => clearInterval(t)
  }, [currentStep, steps.length])

  useEffect(() => {
    const t = setInterval(() => setFactIndex((p) => (p + 1) % list.length), 5000)
    return () => clearInterval(t)
  }, [list.length])

  const active = currentStep ?? auto

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-up">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 text-white">
        <BrainCircuit className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-xl font-semibold text-foreground">{title}</h2>

      <div className="mt-8 w-full max-w-xs space-y-4 text-left">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            {i < active ? (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check className="h-3.5 w-3.5" />
              </span>
            ) : i === active ? (
              <span className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            ) : (
              <span className="h-6 w-6 shrink-0 rounded-full border-2 border-muted" />
            )}
            <span className={`text-sm ${i <= active ? "text-foreground" : "text-muted-foreground"}`}>
              {s}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 flex max-w-sm items-start gap-2.5 rounded-xl border border-border bg-card p-4 text-left">
        <span className="shrink-0 rounded-lg bg-yellow-500 p-1.5 text-white">
          <Lightbulb className="h-4 w-4" />
        </span>
        <p key={factIndex} className="text-xs leading-relaxed text-muted-foreground animate-fade-up">
          {list[factIndex]}
        </p>
      </div>
    </div>
  )
}