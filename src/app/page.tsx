"use client"

import { useState } from "react"
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
  Menu,
  X,
  Command,
  Search,
  LayoutDashboard,
} from "lucide-react"

const features = [
  { icon: Brain, title: "AI-Generated MCQs", desc: "Instant practice questions from any syllabus, tailored to your target test." },
  { icon: FileUp, title: "Upload Your Notes", desc: "PDFs and images become smart question banks with AI extraction." },
  { icon: BarChart3, title: "Track Your Progress", desc: "Accuracy, attempts and history: know exactly where you stand." },
  { icon: MessagesSquare, title: "Community Forum", desc: "Discuss tips and preparation with fellow aspirants." },
]

const exams = ["NTS", "ETEA", "MDCAT", "ECAT", "CSS", "PMS", "Police", "Clerk", "PPSC", "FPSC"]

const stats = [
  { num: "12+", label: "Tests Covered", icon: BookOpen },
  { num: "50K+", label: "MCQs Generated", icon: Zap },
  { num: "10K+", label: "Aspirants", icon: Users },
  { num: "95%", label: "Accuracy Rate", icon: Target },
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
    explanation: "Mitochondria are known as the powerhouse of the cell. They generate most of the cell's supply of ATP through oxidative phosphorylation during aerobic respiration.",
  },
  {
    test: "MDCAT",
    question: "Which particle carries a negative electric charge?",
    options: ["Proton", "Neutron", "Electron", "Photon"],
    answer: "Electron",
    explanation: "Electrons carry a negative charge of approximately -1.6 x 10^-19 coulombs. Protons are positive, neutrons are neutral, and photons carry no charge.",
  },
  {
    test: "English",
    question: "Choose the correct synonym of 'Abundant'.",
    options: ["Scarce", "Plentiful", "Rare", "Minimal"],
    answer: "Plentiful",
    explanation: "'Abundant' means existing in large quantities. 'Plentiful' is its synonym, while scarce, rare and minimal are antonyms.",
  },
  {
    test: "General Knowledge",
    question: "What is the pH value of pure water at 25 degrees Celsius?",
    options: ["5", "6", "7", "8"],
    answer: "7",
    explanation: "Pure water is neutral with a pH of 7 at 25 degrees Celsius, because the concentration of hydrogen ions equals the concentration of hydroxide ions.",
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-foreground transition hover:text-primary"
      >
        {q}
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{a}</p>}
    </div>
  )
}

function SampleDemo() {
  const [q] = useState(sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)])
  const [picked, setPicked] = useState<string | null>(null)
  const [showExpl, setShowExpl] = useState(false)
  const answered = picked !== null
  const isCorrect = picked === q.answer

  return (
    <div className="mt-12 rounded-xl border border-border bg-card p-5 text-left sm:p-6">
      <div className="mb-3 inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
        Try a sample {q.test} question
      </div>
      <h3 className="text-base font-semibold text-foreground sm:text-lg">{q.question}</h3>
      <div className="mt-4 space-y-2">
        {q.options.map((opt, j) => {
          const isPick = picked === opt
          const isAns = opt === q.answer
          let cls = "border-border bg-card text-foreground hover:border-primary/40"
          let badge = "bg-muted text-muted-foreground"
          if (answered && isAns) {
            cls = "border-primary bg-primary/5 text-foreground"
            badge = "bg-primary text-primary-foreground"
          } else if (answered && isPick && !isAns) {
            cls = "border-red-500/60 bg-red-500/5 text-red-600"
            badge = "bg-red-500 text-white"
          } else if (answered) {
            cls = "border-border/40 bg-card/50 text-muted-foreground"
          }
          return (
            <button
              key={j}
              onClick={() => !answered && setPicked(opt)}
              disabled={answered}
              className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5 text-left text-sm transition disabled:cursor-not-allowed ${cls}`}
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${badge}`}>
                {String.fromCharCode(65 + j)}
              </span>
              <span className="flex-1">{opt}</span>
              {answered && isAns && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
              {answered && isPick && !isAns && <XCircle className="h-4 w-4 shrink-0 text-red-500" />}
            </button>
          )
        })}
      </div>
      {answered && (
        <div className={`mt-4 rounded-lg border p-3.5 ${isCorrect ? "border-primary/30 bg-primary/5" : "border-red-500/30 bg-red-500/5"}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium text-foreground">{isCorrect ? "Correct answer" : "Not quite"}</span>
            </div>
            <button onClick={() => setShowExpl(!showExpl)} className="text-xs text-muted-foreground transition hover:text-foreground">
              Explanation
            </button>
          </div>
          {showExpl && <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">{q.explanation}</p>}
          <Link href="/tests" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90">
            Want more? Start Practicing <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}

function BackToTop() {
  const [show, setShow] = useState(false)
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => setShow(window.scrollY > 600))
  }
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-30 rounded-full bg-primary p-2.5 text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <ChevronUp className="h-4 w-4" />
    </button>
  )
}

/* ── Landing Header ── */
function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: "Tests", href: "/tests" },
    { label: "Upload", href: "/upload" },
    { label: "Forum", href: "/forum" },
    { label: "Dashboard", href: "/dashboard" },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-base font-semibold text-foreground">PakTest Prep</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <LayoutDashboard className="h-4 w-4" />
            Get Started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pt-12 pb-16 text-center sm:px-6 sm:pt-16 sm:pb-20">
        <div className="inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground">
          AI-Powered Test Preparation for Pakistan
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Crack every test.
          <br />
          <span className="text-primary">Practice smarter.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
          Generate MCQs from any syllabus or your own notes, track your accuracy, and join a community of aspirants.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/tests"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Start Practicing <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:bg-accent"
          >
            <FileUp className="h-4 w-4" />
            Upload Material
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {exams.map((e) => (
            <span
              key={e}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-primary"
            >
              {e}
            </span>
          ))}
        </div>

        <SampleDemo />
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <s.icon className="h-4 w-4 text-primary" />
                  <span className="text-2xl font-bold text-foreground">{s.num}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Everything you need to ace your exam</h2>
          <p className="mt-2 text-muted-foreground">Built by aspirants, for aspirants.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-5 transition hover:border-primary/30"
            >
              <span className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">How it works</h2>
          <p className="mt-2 text-muted-foreground">From zero to exam-ready in three steps.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.num} className="relative rounded-xl border border-border bg-card p-5">
              <span className="text-3xl font-bold text-muted">{s.num}</span>
              <h3 className="mt-2 text-base font-semibold text-foreground">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              {i < 2 && (
                <div className="absolute -right-2 top-1/2 hidden -translate-y-1/2 md:block">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border bg-card py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Loved by aspirants</h2>
            <p className="mt-2 text-muted-foreground">Real results from real students.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-border bg-background p-5">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.exam} · {t.score}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Frequently asked questions</h2>
          <p className="mt-2 text-muted-foreground">Got questions? We have answers.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          {faqs.map((f) => (
            <FAQItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-20 text-center sm:px-6">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Ready to crack your exam?</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Join thousands of aspirants practicing smarter every day. It takes 30 seconds to start.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/tests"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Start Free Practice <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:bg-accent"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <GraduationCap className="h-4 w-4" />
                </div>
                PakTest Prep
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                AI-powered test preparation built for Pakistan&apos;s competitive exams. Practice smarter, score higher.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">Product</h4>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li><Link href="/tests" className="transition hover:text-foreground">Practice Tests</Link></li>
                <li><Link href="/upload" className="transition hover:text-foreground">Upload Notes</Link></li>
                <li><Link href="/dashboard" className="transition hover:text-foreground">Dashboard</Link></li>
                <li><Link href="/forum" className="transition hover:text-foreground">Community</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">Tests</h4>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li><Link href="/tests/MDCAT" className="transition hover:text-foreground">MDCAT</Link></li>
                <li><Link href="/tests/ECAT" className="transition hover:text-foreground">ECAT</Link></li>
                <li><Link href="/tests/CSS%20%26%20PMS" className="transition hover:text-foreground">CSS & PMS</Link></li>
                <li><Link href="/tests" className="transition hover:text-foreground">View All</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">Company</h4>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li><span className="cursor-pointer transition hover:text-foreground">About</span></li>
                <li><span className="cursor-pointer transition hover:text-foreground">Privacy</span></li>
                <li><span className="cursor-pointer transition hover:text-foreground">Terms</span></li>
                <li><span className="cursor-pointer transition hover:text-foreground">Contact</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">© 2026 PakTest Prep. Built for Pakistan&apos;s future.</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Made with <Zap className="h-3 w-3 text-primary" /> in Pakistan
            </div>
          </div>
        </div>
      </footer>

      <BackToTop />
    </main>
  )
}