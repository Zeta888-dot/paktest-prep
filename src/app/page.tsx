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
  { icon: BarChart3, title: "Track Your Progress", desc: "Accuracy, attempts and history: know exactly where you stand." },
  { icon: MessagesSquare, title: "Community Forum", desc: "Discuss tips and preparation with fellow aspirants." },
]

const exams = ["NTS", "ETEA", "MDCAT", "ECAT", "CSS", "PMS", "Police", "Clerk", "PPSC", "FPSC"]

const sampleQuestion = {
  test: "MDCAT",
  question: "Which organelle is responsible for ATP production in eukaryotic cells?",
  options: ["Ribosome", "Mitochondria", "Golgi apparatus", "Endoplasmic reticulum"],
  answer: "Mitochondria",
  explanation:
    "Mitochondria are known as the powerhouse of the cell. They generate most of the cell's supply of ATP through oxidative phosphorylation during aerobic respiration.",
}

function Mascot() {
  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-28 w-28 animate-float" fill="none">
      <ellipse cx="100" cy="120" rx="55" ry="50" fill="#10b981" />
      <ellipse cx="100" cy="132" rx="38" ry="30" fill="#d1fae5" />
      <ellipse cx="48" cy="120" rx="12" ry="24" fill="#059669" />
      <ellipse cx="152" cy="120" rx="12" ry="24" fill="#059669" />
      <circle cx="80" cy="105" r="16" fill="white" />
      <circle cx="120" cy="105" r="16" fill="white" />
      <circle cx="83" cy="107" r="7" fill="#0f172a" />
      <circle cx="117" cy="107" r="7" fill="#0f172a" />
      <circle cx="85" cy="105" r="2.5" fill="white" />
      <circle cx="119" cy="105" r="2.5" fill="white" />
      <path d="M95 118 L105 118 L100 128 Z" fill="#f59e0b" />
      <ellipse cx="85" cy="170" rx="10" ry="5" fill="#f59e0b" />
      <ellipse cx="115" cy="170" rx="10" ry="5" fill="#f59e0b" />
      <path d="M100 38 L162 62 L100 86 L38 62 Z" fill="#0f172a" />
      <path d="M70 74 v16 c0 10 60 10 60 0 V74" fill="#1e293b" />
      <line x1="162" y1="62" x2="162" y2="94" stroke="#f59e0b" strokeWidth="4" />
      <circle cx="162" cy="98" r="5" fill="#f59e0b" />
    </svg>
  )
}

function SampleDemo() {
  const [picked, setPicked] = useState<string | null>(null)
  const [showExpl, setShowExpl] = useState(false)
  const answered = picked !== null
  const isCorrect = picked === sampleQuestion.answer

  return (
    <div className="animate-fade-up mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left backdrop-blur-sm [animation-delay:0.5s] sm:p-8">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
        <Sparkles className="h-3 w-3" />
        Try a sample {sampleQuestion.test} question
      </div>

      <h3 className="text-xl font-semibold">{sampleQuestion.question}</h3>

      <div className="mt-5 space-y-3">
        {sampleQuestion.options.map((opt, j) => {
          const isPick = picked === opt
          const isAns = opt === sampleQuestion.answer
          let cls = "border-white/10 bg-white/[0.02] text-white/80 hover:border-emerald-400/40 hover:bg-white/[0.05]"
          if (answered && isAns) cls = "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
          else if (answered && isPick && !isAns) cls = "border-red-400/50 bg-red-400/10 text-red-300"
          else if (answered) cls = "border-white/5 bg-white/[0.01] text-white/30"
          return (
            <button
              key={j}
              onClick={() => !answered && setPicked(opt)}
              disabled={answered}
              className={`w-full rounded-xl border px-5 py-3 text-left text-sm transition active:scale-[0.98] disabled:cursor-not-allowed ${cls}`}
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
            isCorrect
              ? "animate-bounce-in border-emerald-400/30 bg-emerald-400/10"
              : "animate-shake border-red-400/30 bg-red-400/10"
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
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(52,211,153,0.35)] transition hover:bg-emerald-300 active:scale-[0.98] sm:w-auto"
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
            <GraduationCap className="h-6 w-6 text-emerald-400" />
            PakTest Prep
          </div>
          <Link
            href="/dashboard"
            className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-white/90 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-4xl px-6 pt-12 pb-16 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-grid absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />
          <div className="animate-glow absolute left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="animate-glow absolute left-1/3 top-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl [animation-delay:1.5s]" />
        </div>

        <div className="relative">
          <Mascot />

          <div className="animate-fade-up mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-xs text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Test Preparation for Pakistan
          </div>

          <h1 className="animate-fade-up mt-6 text-5xl font-bold tracking-tight sm:text-7xl [animation-delay:0.1s]">
            Crack every test.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Practice smarter.
            </span>
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-lg text-white/60 [animation-delay:0.2s]">
            Generate MCQs from any syllabus or your own notes, track your accuracy, and join a community of aspirants.
          </p>

          <div className="animate-fade-up mt-8 flex items-center justify-center gap-3 [animation-delay:0.3s]">
            <Link
              href="/tests"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(52,211,153,0.35)] transition hover:bg-emerald-300 active:scale-[0.98]"
            >
              Start Practicing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/upload"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5 active:scale-[0.98]"
            >
              Upload Material
            </Link>
          </div>

          

          <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-2 [animation-delay:0.4s]">
            {exams.map((e) => (
              <span key={e} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50 transition hover:border-emerald-400/30 hover:text-emerald-300">
                {e}
              </span>
            ))}
          </div>

          <SampleDemo />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-white/[0.06]"
            >
              <span className="inline-block rounded-lg bg-emerald-400/10 p-2 text-emerald-400 transition group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-medium">{f.title}</h3>
              <p className="mt-2 text-sm text-white/50">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © 2026 PakTest Prep. Built for Pakistan&apos;s future.
      </footer>
    </main>
  )
}