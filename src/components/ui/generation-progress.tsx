"use client"

import { useEffect, useState } from "react"
import { Check, Loader2, Sparkles } from "lucide-react"

const DEFAULT_STEPS = [
  "Reading your selected topics",
  "Crafting fresh questions",
  "Verifying correct answers",
  "Polishing explanations",
  "Almost there",
]

export function GenerationProgress({
  title = "Generating your MCQs",
  steps = DEFAULT_STEPS,
}: {
  title?: string
  steps?: string[]
}) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => Math.min(prev + 1, steps.length - 1))
    }, 2200)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-sm flex-col items-center justify-center animate-fade-up">
      <div className="mb-5 rounded-full bg-primary/10 p-3 text-primary">
        <Sparkles className="h-6 w-6 animate-pulse" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-6 w-full space-y-3">
        {steps.map((s, i) => {
          const done = i < active
          const current = i === active
          return (
            <div
              key={s}
              className={`flex items-center gap-3 text-sm transition-colors ${
                done || current ? "text-foreground" : "text-muted-foreground/40"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition ${
                  done ? "bg-emerald-500 text-white" : current ? "text-primary" : "border border-border"
                }`}
              >
                {done ? (
                  <Check className="h-3 w-3 animate-bounce-in" />
                ) : current ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
              </span>
              {s}
            </div>
          )
        })}
      </div>
    </div>
  )
}