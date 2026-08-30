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
  Check,
  Star,
  Users,
  Zap,
  BookOpen,
  Trophy,
  Clock,
  Shield,
  Target,
  ChevronUp,
} from "lucide-react"

const features = [
  { icon: Brain, title: "AI-Generated MCQs", desc: "Instant practice questions from any syllabus, tailored to your target test." },
  { icon: FileUp, title: "Upload Your Notes", desc: "PDFs and images become smart question banks with AI extraction." },
  { icon: BarChart3, title: "Track Your Progress", desc: "Accuracy, attempts and history: know exactly where you stand." },
  { icon: MessagesSquare, title: "Community Forum", desc: "Discuss tips and preparation with fellow aspirants." },
]

const exams = ["NTS", "ETEA", "MDCAT", "ECAT", "CSS", "PMS", "Police", "Clerk", "PPSC", "FPSC"]

const stats = [
  { value: "12", label: "Tests Covered", icon: BookOpen },
  { value: "50K+", label: "MCQs Generated", icon: Zap },
  { value: "10K+", label: "Aspirants", icon: Users },
  { value: "95%", label: "Accuracy Rate", icon: Target },
]

const steps = [
  { num: "01", title: "Pick Your Test", desc: "Choose from 12+ competitive exams with official syllabus coverage." },
  { num: "02", title: "Practice with AI", desc: "Generate unlimited MCQs instantly. Upload notes for personalized questions." },
  { num: "03", title: "Track & Improve", desc: "See weak areas, build streaks, and climb the leaderboard." },
]

const testimonials = [
  { name: "Ahmed R.", exam: "MDCAT 2025", score: "92%", text: "The AI-generated questions were surprisingly close to the actual exam. My accuracy went from 60% to 85% in 3 weeks." },
  { name: "Fatima K.", exam: "CSS", score: "Top 50", text: "Finally a prep platform that understands the Pakistani exam system. The subjective practice is a game changer." },
  { name: "Usman T.", exam: "PPSC", score: "Selected", text: "Used it for 2 months before my interview. The mock tests felt exactly like the real thing." },
]

const faqs = [
  { q: "How accurate are the AI-generated questions?", a: "Our AI is trained on official syllabi and past papers. Questions match the pattern, difficulty, and topic distribution of real exams." },
  { q: "Can I upload my own notes?", a: "Yes. Upload PDFs or images and our RAG system extracts key concepts to generate personalized MCQs from your material." },
  { q: "Is it free to use?", a: "The core practice features are free. Premium plans unlock unlimited uploads, advanced analytics, and mock tests." },
  { q: "Which exams are supported?", a: "MDCAT, ECAT, CSS, PMS, PPSC, FPSC, NTS, ETEA, Police, Clerk, SST, CT, PST, and more." },
  { q: "Does it work offline?", a: "Yes. Install as a PWA and practice cached questions even without internet." },
]

const sampleQuestion = {
  test: "MDCAT",
  question: "Which organelle is responsible for ATP production in eukaryotic cells?",
  options: ["Ribosome", "Mitochondria", "Golgi apparatus", "Endoplasmic reticulum"],
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
    <div className="animate-fade-up mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left backdrop-blur-sm [animation-delay:0.5s] sm:p-8">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs text-indigo-300">
        <Sparkles className="h-3 w-3" />
        Try a sample {sampleQuestion.test} question
      </div>

      <h3 className="text-xl font-semibold">{sampleQuestion.question}</h3>

      <div className="mt-5 space-y-3">
        {sampleQuestion.options.map((opt, j) => {
          const isPick = picked === opt
          const isAns = opt === sampleQuestion.answer
          let cls = "border-white/10 bg-white/[0.02] text-white/80 hover:border-indigo-400/40 hover:bg-white/[0.05]"
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
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-400 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(99,102,241,0.35)] transition hover:bg-indigo-300 active:scale-[0.98] sm:w-auto"
        >
          Want more? Start Practicing <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-white/90 transition hover:text-white"
      >
        {q}
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-white/50">{a}</p>}
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
              <GraduationCap className="h-5 w-5 text-indigo-400" />
            </div>
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

      {/* Hero */}
      <section className="relative mx-auto max-w-4xl px-6 pt-16 pb-20 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        </div>

        <div className="relative">
          <div className="animate-fade-up mx-auto mt-2 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-1.5 text-xs text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Test Preparation for Pakistan
          </div>

          <h1 className="animate-fade-up mt-8 text-5xl font-bold tracking-tight sm:text-7xl [animation-delay:0.1s]">
            Crack every test.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Practice smarter.
            </span>
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-lg text-white/50 [animation-delay:0.2s]">
            Generate MCQs from any syllabus or your own notes, track your accuracy, and join a community of aspirants.
          </p>

          <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3 [animation-delay:0.3s]">
            <Link
              href="/tests"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-400 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(99,102,241,0.35)] transition hover:bg-indigo-300 active:scale-[0.98]"
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
              <span key={e} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50 transition hover:border-indigo-400/30 hover:text-indigo-300">
                {e}
              </span>
            ))}
          </div>

          <SampleDemo />
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <s.icon className="h-4 w-4 text-indigo-400" />
                  <span className="text-2xl font-bold text-white">{s.value}</span>
                </div>
                <p className="mt-1 text-xs text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Everything you need to ace your exam</h2>
          <p className="mt-3 text-white/50">Built by aspirants, for aspirants.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.06]"
            >
              <span className="inline-block rounded-lg bg-indigo-400/10 p-2 text-indigo-400 transition group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-medium">{f.title}</h3>
              <p className="mt-2 text-sm text-white/50">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">How it works</h2>
          <p className="mt-3 text-white/50">From zero to exam-ready in three steps.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.num} className="relative rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <span className="text-4xl font-bold text-white/10">{s.num}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-white/50">{s.desc}</p>
              {i < 2 && (
                <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block">
                  <ArrowRight className="h-5 w-5 text-white/20" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-white/5 bg-white/[0.02] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Loved by aspirants</h2>
            <p className="mt-3 text-white/50">Real results from real students.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/70">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-white/40">{t.exam} · {t.score}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Frequently asked questions</h2>
          <p className="mt-3 text-white/50">Got questions? We have answers.</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <div className="rounded-2xl border border-indigo-400/20 bg-gradient-to-b from-indigo-500/10 to-transparent p-10">
          <h2 className="text-3xl font-bold">Ready to crack your exam?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/50">Join thousands of aspirants practicing smarter every day. It takes 30 seconds to start.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tests"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-400 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_30px_rgba(99,102,241,0.35)] transition hover:bg-indigo-300 active:scale-[0.98]"
            >
              Start Free Practice <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5 active:scale-[0.98]"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20">
                  <GraduationCap className="h-4 w-4 text-indigo-400" />
                </div>
                PakTest Prep
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/40">AI-powered test preparation built for Pakistan&apos;s competitive exams. Practice smarter, score higher.</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white/80">Product</h4>
              <ul className="mt-3 space-y-2 text-xs text-white/40">
                <li><Link href="/tests" className="transition hover:text-white/70">Practice Tests</Link></li>
                <li><Link href="/upload" className="transition hover:text-white/70">Upload Notes</Link></li>
                <li><Link href="/dashboard" className="transition hover:text-white/70">Dashboard</Link></li>
                <li><Link href="/forum" className="transition hover:text-white/70">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white/80">Tests</h4>
              <ul className="mt-3 space-y-2 text-xs text-white/40">
                <li><Link href="/tests/MDCAT" className="transition hover:text-white/70">MDCAT</Link></li>
                <li><Link href="/tests/ECAT" className="transition hover:text-white/70">ECAT</Link></li>
                <li><Link href="/tests/CSS%20%26%20PMS" className="transition hover:text-white/70">CSS & PMS</Link></li>
                <li><Link href="/tests" className="transition hover:text-white/70">View All</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white/80">Company</h4>
              <ul className="mt-3 space-y-2 text-xs text-white/40">
                <li><span className="transition hover:text-white/70 cursor-pointer">About</span></li>
                <li><span className="transition hover:text-white/70 cursor-pointer">Privacy</span></li>
                <li><span className="transition hover:text-white/70 cursor-pointer">Terms</span></li>
                <li><span className="transition hover:text-white/70 cursor-pointer">Contact</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
            <p className="text-xs text-white/30">© 2026 PakTest Prep. Built for Pakistan&apos;s future.</p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/30">Made with</span>
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}