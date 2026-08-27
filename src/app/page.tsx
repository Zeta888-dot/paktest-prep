"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Brain,
  FileUp,
  BarChart3,
  MessagesSquare,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from "lucide-react"

const features = [
  { icon: Brain, title: "AI-Generated MCQs", desc: "Instant practice questions from any syllabus, tailored to your target test." },
  { icon: FileUp, title: "Upload Your Notes", desc: "PDFs and images become smart question banks with AI extraction." },
  { icon: BarChart3, title: "Track Your Progress", desc: "Accuracy, attempts and history — know exactly where you stand." },
  { icon: MessagesSquare, title: "Community Forum", desc: "Discuss tips and preparation with fellow aspirants." },
]

const exams = ["NTS", "ETEA", "MDCAT", "ECAT", "CSS", "PMS", "Police", "Clerk", "PPSC", "FPSC"]

const sampleQuestion = {
  test: "MDCAT",
  question: "Which organelle is responsible for ATP production in eukaryotic cells?",
  options: [
    "Ribosome",
    "Mitochondria",
    "Golgi apparatus",
    "Endoplasmic reticulum",
  ],
  answer: "Mitochondria",
  explanation:
    "Mitochondria are known as the powerhouse of the cell. They generate most of the cell's supply of ATP through oxidative phosphorylation during aerobic respiration.",
}

function SampleDemo() {
  const [picked, setPicked] = useState<string | null>(null)
  const [showExpl, setShowExpl] = useState(false)
  const answered = picked !== null
  const isCorrect = picked === sampleQuestion.answer

  return (
    <div className="animate-fade-up mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 text-left [animation-delay:0.5s]">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
        <Sparkles className="h-3 w-3" />
        Try a sample {sampleQuestion.test} question
      </div>

      <h3 className="text-xl font-semibold">{sampleQuestion.question}</h3>

      <div className="mt-5 space-y-3">
        {sampleQuestion.options.map((opt, j) => {
          const isPick = picked === opt
          const isAns = opt === sampleQuestion.answer
          let cls = "border-white/10 bg-white/[0.02] text-white/80 hover:border-white/30"
          if (answered && isAns) cls = "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
          else if (answered && isPick && !isAns) cls = "border-red-400/50 bg-red-400/10 text-red-300"
          else if (answered) cls = "border-white/5 bg-white/[0.01] text-white/30"
          return (
            <button
              key={j}
              onClick={() => !answered && setPicked(opt)}
              disabled={answered}
              className={`w-full rounded-xl border px-5 py-3 text-left text-sm transition disabled:cursor-not-allowed ${cls}`}
            >
              <span className="mr-2 font-medium text-white/50">{String.fromCharCode(65 + j)}.</span>
              {opt}
            </button>
          )
        })}
      </div>

      {answered && (
        <div
          className={`mt-5 rounded-xl border p-4 ${
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
            <button
              onClick={() => setShowExpl(!showExpl)}
              className="flex items-center gap-1 text-xs text-white/60 transition hover:text-white"
            >
              Explanation
              <ChevronDown className={`h-4 w-4 transition-transform ${showExpl ? "rotate-180" : ""}`} />
            </button>
          </div>
          {showExpl && (
            <div className="mt-3 border-t border-white/10 pt-3 text-sm text-white/60">
              {sampleQuestion.explanation}
            </div>
          )}
        </div>
      )}

      {answered && (
        <Link
          href="/tests"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90 sm:w-auto"
        >
          Want more? Start Practicing <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <GraduationCap className="h-6 w-6" />
            PakTest Prep
          </div>
          <Link
            href="/dashboard"
            className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-grid absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />
          <div className="animate-glow absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="animate-float absolute left-[12%] top-[22%] h-3 w-3 rounded-full bg-white/40" />
          <div className="animate-float absolute right-[18%] top-[32%] h-2 w-2 rounded-full bg-white/50 [animation-delay:1s]" />
          <div className="animate-float absolute bottom-[24%] left-[28%] h-2.5 w-2.5 rounded-full bg-white/35 [animation-delay:2s]" />
          <div className="animate-float absolute bottom-[32%] right-[30%] h-2 w-2 rounded-full bg-white/45 [animation-delay:3s]" />
          <div className="animate-float absolute left-[45%] top-[15%] h-2.5 w-2.5 rounded-full bg-white/40 [animation-delay:4s]" />
        </div>

        <div className="animate-fade-up mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/70">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Test Preparation for Pakistan
        </div>

        <h1 className="animate-fade-up text-5xl font-bold tracking-tight sm:text-7xl [animation-delay:0.1s]">
          Crack every test.
          <br />
          <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Practice smarter.
          </span>
        </h1>

        <p className="animate-fade-up mx-auto mt-6 max-w-xl text-lg text-white/60 [animation-delay:0.2s]">
          Generate MCQs from any syllabus or your own notes, track your accuracy, and join a community of aspirants.
        </p>

        <div className="animate-fade-up mt-8 flex items-center justify-center gap-3 [animation-delay:0.3s]">
          <Link
            href="/tests"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Start Practicing <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/upload"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5"
          >
            Upload Material
          </Link>
        </div>

        <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-2 [animation-delay:0.4s]">
          {exams.map((e) => (
            <span key={e} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
              {e}
            </span>
          ))}
        </div>

        <SampleDemo />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:bg-white/[0.06]"
            >
              <f.icon className="h-5 w-5 text-white/80" />
              <h3 className="mt-4 font-medium">{f.title}</h3>
              <p className="mt-2 text-sm text-white/50">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © 2026 PakTest Prep — Built for Pakistan&apos;s future.
      </footer>
    </main>
  )
}