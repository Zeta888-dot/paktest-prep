"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Brain,
  FileUp,
  BarChart3,
  MessagesSquare,
  GraduationCap,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Star,
  Users,
  Zap,
  BookOpen,
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
  { num: 12, suffix: "", label: "Tests Covered", icon: BookOpen },
  { num: 50, suffix: "K+", label: "MCQs Generated", icon: Zap },
  { num: 10, suffix: "K+", label: "Aspirants", icon: Users },
  { num: 95, suffix: "%", label: "Accuracy Rate", icon: Target },
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

const sampleQuestions = [
  {
    test: "MDCAT",
    question: "Which organelle is responsible for ATP production in eukaryotic cells?",
    options: ["Ribosome", "Mitochondria", "Golgi apparatus", "Endoplasmic reticulum"],
    answer: "Mitochondria",
    explanation:
      "Mitochondria are known as the powerhouse of the cell. They generate most of the cell's supply of ATP through oxidative phosphorylation during aerobic respiration.",
  },
  {
    test: "MDCAT",
    question: "Which particle carries a negative electric charge?",
    options: ["Proton", "Neutron", "Electron", "Photon"],
    answer: "Electron",
    explanation:
      "Electrons carry a negative charge of approximately -1.6 x 10^-19 coulombs. Protons are positive, neutrons are neutral, and photons carry no charge.",
  },
  {
    test: "English",
    question: "Choose the correct synonym of 'Abundant'.",
    options: ["Scarce", "Plentiful", "Rare", "Minimal"],
    answer: "Plentiful",
    explanation:
      "'Abundant' means existing in large quantities. 'Plentiful' is its synonym, while scarce, rare and minimal are antonyms.",
  },
  {
    test: "General Knowledge",
    question: "What is the pH value of pure water at 25 degrees Celsius?",
    options: ["5", "6", "7", "8"],
    answer: "7",
    explanation:
      "Pure water is neutral with a pH of 7 at 25 degrees Celsius, because the concentration of hydrogen ions equals the concentration of hydroxide ions.",
  },
]

function useInView(threshold = 0.15) {
  const ref = useRef<any>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      {children}
    </div>
  )
}

function CountUp({ num, suffix }: { num: number; suffix: string }) {
  const { ref, inView } = useInView()
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start: number | null = null
    let raf: number
    const step = (ts: number) => {
      if (start === null) start = ts
      const p = Math.min((ts - start) / 1200, 1)
      setVal(Math.round(num * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, num])
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  )
}

function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title="Back to top"
      className={`fixed bottom-6 right-6 z-30 rounded-full bg-indigo-400 p-3 text-black shadow-[0_0_18px_rgba(99,102,241,0.25)] transition-all duration-300 hover:scale-110 hover:bg-indigo-300 active:scale-95 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  )
}

function SampleDemo() {
  const [q, setQ] = useState(sampleQuestions[0])
  const [picked, setPicked] = useState<string | null>(null)
  const [showExpl, setShowExpl] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("sample-q")
    let idx = stored !== null ? Number(stored) : NaN
    if (Number.isNaN(idx) || !sampleQuestions[idx]) {
      idx = Math.floor(Math.random() * sampleQuestions.length)
      sessionStorage.setItem("sample-q", String(idx))
    }
    setQ(sampleQuestions[idx])
  }, [])

  const answered = picked !== null
  const isCorrect = picked === q.answer

  return (
    <div className="animate-fade-up mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left backdrop-blur-sm [animation-delay:0.5s] sm:p-8">
      <div className="mb-4 inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs text-indigo-300">
        Try a sample {q.test} question
      </div>

      <h3 className="text-xl font-semibold">{q.question}</h3>

      <div className="mt-5 space-y-3">
        {q.options.map((opt, j) => {
          const isPick = picked === opt
          const isAns = opt === q.answer
          let cls = "border-white/10 bg-white/[0.02] text-white/80 hover:border-indigo-400/40 hover:bg-white/[0.05]"
          let badge = "bg-white/5 text-white/50"
          let right: React.ReactNode = null
          if (answered && isAns) {
            cls = "border-indigo-400/60 bg-indigo-400/10 text-white"
            badge = "bg-indigo-400 text-black"
            right = <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-400" />
          } else if (answered && isPick && !isAns) {
            cls = "border-red-400/60 bg-red-400/10 text-red-300"
            badge = "bg-red-400 text-black"
            right = <XCircle className="h-5 w-5 shrink-0 text-red-400" />
          } else if (answered) {
            cls = "border-white/5 bg-white/[0.01] text-white/30"
          }
          return (
            <button
              key={j}
              onClick={() => !answered && setPicked(opt)}
              disabled={answered}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition active:scale-[0.98] disabled:cursor-not-allowed ${cls}`}
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${badge}`}>
                {String.fromCharCode(65 + j)}
              </span>
              <span className="flex-1">{opt}</span>
              {right}
            </button>
          )
        })}
      </div>

      {answered && (
        <div
          className={`mt-5 rounded-xl border p-4 ${
            isCorrect
              ? "animate-bounce-in border-indigo-400/30 bg-indigo-400/10"
              : "animate-shake border-red-400/30 bg-red-400/10"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isCorrect ? "bg-indigo-400/20 text-indigo-400" : "bg-red-400/20 text-red-400"
                }`}
              >
                {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              </span>
              <div>
                <div className="font-semibold text-white">{isCorrect ? "Correct answer" : "Not quite"}</div>
                <p className="text-xs text-white/60">
                  {isCorrect ? "Nice work. Keep the momentum going." : "Review the explanation before moving on."}
                </p>
              </div>
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
            <div className="mt-3 border-t border-white/10 pt-3 text-sm text-white/60">{q.explanation}</div>
          )}
          <Link
            href="/tests"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-400 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_18px_rgba(99,102,241,0.25)] transition hover:scale-105 hover:bg-indigo-300 active:scale-95"
          >
            Want more? Start Practicing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10 last:border-0">
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
            className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:scale-105 hover:bg-white/90 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-4xl px-6 pt-8 pb-20 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-500/[0.07] blur-3xl" />
          <div className="absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-violet-500/[0.07] blur-3xl" />
        </div>

        <div className="relative">
          <div className="animate-fade-up mx-auto inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-1.5 text-xs text-indigo-300">
            AI-Powered Test Preparation for Pakistan
          </div>

          <h1 className="animate-fade-up mt-6 text-5xl font-bold tracking-tight sm:text-7xl [animation-delay:0.1s]">
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
              className="inline-flex items-center gap-2 rounded-full bg-indigo-400 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_18px_rgba(99,102,241,0.25)] transition hover:scale-105 hover:bg-indigo-300 active:scale-95"
            >
              Start Practicing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/upload"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:scale-105 hover:bg-white/5 active:scale-95"
            >
              Upload Material
            </Link>
          </div>

          <div className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-2 [animation-delay:0.4s]">
            {exams.map((e) => (
              <span
                key={e}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50 transition hover:scale-105 hover:border-indigo-400/30 hover:text-indigo-300"
              >
                {e}
              </span>
            ))}
          </div>

          <SampleDemo />
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <s.icon className="h-4 w-4 text-indigo-400" />
                  <span className="text-2xl font-bold text-white">
                    <CountUp num={s.num} suffix={s.suffix} />
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Everything you need to ace your exam</h2>
            <p className="mt-3 text-white/50">Built by aspirants, for aspirants.</p>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="group rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-white/[0.06]">
                <span className="inline-block rounded-lg bg-indigo-400/10 p-2 text-indigo-400 transition group-hover:scale-110">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-white/50">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="mt-3 text-white/50">From zero to exam-ready in three steps.</p>
          </div>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 120}>
              <div className="relative rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-indigo-400/30">
                <span className="text-4xl font-bold text-white/10">{s.num}</span>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-white/50">{s.desc}</p>
                {i < 2 && (
                  <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 md:block">
                    <ArrowRight className="h-5 w-5 text-white/20" />
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-white/5 bg-white/[0.02] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">Loved by aspirants</h2>
              <p className="mt-3 text-white/50">Real results from real students.</p>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 120}>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-indigo-400/30">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/70">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-300">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-white/40">
                        {t.exam} · {t.score}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24">
        <Reveal>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Frequently asked questions</h2>
            <p className="mt-3 text-white/50">Got questions? We have answers.</p>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
            {faqs.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24 text-center">
        <Reveal>
          <div className="rounded-2xl border border-indigo-400/20 bg-gradient-to-b from-indigo-500/10 to-transparent p-10">
            <h2 className="text-3xl font-bold">Ready to crack your exam?</h2>
            <p className="mx-auto mt-3 max-w-md text-white/50">
              Join thousands of aspirants practicing smarter every day. It takes 30 seconds to start.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tests"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-400 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_18px_rgba(99,102,241,0.25)] transition hover:scale-105 hover:bg-indigo-300 active:scale-95"
              >
                Start Free Practice <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:scale-105 hover:bg-white/5 active:scale-95"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

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
              <p className="mt-3 text-xs leading-relaxed text-white/40">
                AI-powered test preparation built for Pakistan&apos;s competitive exams. Practice smarter, score higher.
              </p>
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
                <li><span className="cursor-pointer transition hover:text-white/70">About</span></li>
                <li><span className="cursor-pointer transition hover:text-white/70">Privacy</span></li>
                <li><span className="cursor-pointer transition hover:text-white/70">Terms</span></li>
                <li><span className="cursor-pointer transition hover:text-white/70">Contact</span></li>
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

      <BackToTop />
    </main>
  )
}