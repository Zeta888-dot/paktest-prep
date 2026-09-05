"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, BookOpen, Brain, Check, ChevronDown, FileUp, GraduationCap, Menu, Sparkles, Target, Trophy, Users, X, Zap } from "lucide-react"

const exams = ["MDCAT", "ECAT", "CSS", "PMS", "NTS", "ETEA", "Police", "PPSC"]
const features = [
  { icon: Brain, title: "Practice that adapts", text: "AI-generated MCQs turn your syllabus and notes into focused practice." },
  { icon: Target, title: "Know your weak spots", text: "See accuracy by topic and spend your time where it actually matters." },
  { icon: Trophy, title: "Prepare like the real thing", text: "Timed tests, realistic difficulty and exam-specific question patterns." },
]
const faqs = [
  ["What exams can I prepare for?", "PakTest Prep is built around Pakistani competitive and admission tests including MDCAT, ECAT, CSS, PMS, NTS, ETEA, police, teaching and clerical exams."],
  ["Can I use my own notes?", "Yes. Upload your study material and use it as the source for personalized AI practice."],
  ["Is PakTest Prep free?", "The core preparation experience is designed to be accessible, with advanced capabilities added as the platform grows."],
]

function Header() {
  const [open, setOpen] = useState(false)
  return <header className="sticky top-0 z-50 border-b border-[#e2ddd4]/80 bg-[#f3f0e9]/90 backdrop-blur-xl">
    <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 lg:px-8">
      <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#5c2ac6] text-white"><GraduationCap className="h-5 w-5" /></span><span className="text-[15px] font-extrabold tracking-tight">PakTest Prep</span></Link>
      <nav className="hidden items-center gap-8 md:flex"><Link href="#why" className="text-sm font-medium text-[#696a67] hover:text-[#1d2020]">Why PakTest</Link><Link href="#exams" className="text-sm font-medium text-[#696a67] hover:text-[#1d2020]">Exams</Link><Link href="#how" className="text-sm font-medium text-[#696a67] hover:text-[#1d2020]">How it works</Link></nav>
      <div className="hidden items-center gap-3 md:flex"><Link href="/signin" className="px-3 py-2 text-sm font-semibold">Sign in</Link><Link href="/tests" className="rounded-full bg-[#5c2ac6] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5">Start practicing <ArrowRight className="ml-1 inline h-4 w-4" /></Link></div>
      <button onClick={() => setOpen(!open)} className="md:hidden">{open ? <X /> : <Menu />}</button>
    </div>
    {open && <div className="border-t border-[#e2ddd4] bg-[#f3f0e9] px-5 py-4 md:hidden"><div className="flex flex-col gap-1"><Link onClick={() => setOpen(false)} href="#why" className="rounded-xl p-3">Why PakTest</Link><Link onClick={() => setOpen(false)} href="#exams" className="rounded-xl p-3">Exams</Link><Link onClick={() => setOpen(false)} href="/signin" className="mt-2 rounded-xl bg-[#1d2020] p-3 text-center font-bold text-white">Sign in</Link></div></div>}
  </header>
}

function Footer() { return <footer className="bg-[#1d2020] px-5 py-14 text-white lg:px-8"><div className="mx-auto max-w-7xl"><div className="grid gap-10 md:grid-cols-4"><div className="md:col-span-2"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#c3ff3d] text-[#1d2020]"><GraduationCap className="h-5 w-5" /></span><b>PakTest Prep</b></div><p className="mt-5 max-w-sm text-sm leading-6 text-white/55">A focused preparation platform for students and aspirants across Pakistan.</p></div><div><p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/35">Explore</p><div className="space-y-3 text-sm text-white/65"><Link className="block hover:text-white" href="/tests">Practice tests</Link><Link className="block hover:text-white" href="/upload">Upload material</Link><Link className="block hover:text-white" href="/forum">Community</Link></div></div><div><p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/35">Account</p><div className="space-y-3 text-sm text-white/65"><Link className="block hover:text-white" href="/signin">Sign in</Link><Link className="block hover:text-white" href="/settings">Settings</Link></div></div></div><div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/35">© 2026 PakTest Prep. Built for better preparation.</div></div></footer> }

export default function Home() {
  return <main className="bg-[#f3f0e9] text-[#1d2020]">
    <Header />
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <div className="eyebrow inline-flex items-center gap-2 rounded-full bg-[#c3ff3d] px-4 py-2 text-[#1d2020]"><Sparkles className="h-3.5 w-3.5" /> Pakistan's focused test-prep workspace</div>
          <h1 className="display-heading mt-7 max-w-4xl text-6xl sm:text-7xl lg:text-[92px]">Your exam. <span className="text-[#5c2ac6]">Your edge.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#696a67] sm:text-lg">Stop jumping between PDFs, random MCQs and forgotten notes. Practice smarter, understand your weak areas and walk into your test prepared.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link href="/tests" className="rounded-full bg-[#5c2ac6] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#5c2ac6]/15 transition hover:-translate-y-0.5">Start practicing <ArrowRight className="ml-2 inline h-4 w-4" /></Link><Link href="/upload" className="rounded-full border border-[#cfc9be] bg-white px-6 py-3.5 text-sm font-bold transition hover:-translate-y-0.5">Upload your notes</Link></div>
          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#8a8882]"><span className="text-[#1d2020]">Built around</span>{exams.slice(0,5).map(e => <span key={e}>{e}</span>)}</div>
        </div>
        <div className="relative">
          <div className="surface soft-shadow rotate-1 p-4 sm:p-5"><div className="rounded-[1rem] bg-[#f3f0e9] p-5 sm:p-7"><div className="flex items-center justify-between"><span className="eyebrow text-[#5c2ac6]">Practice studio</span><span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold">MDCAT · Biology</span></div><h3 className="mt-7 text-xl font-extrabold leading-7 sm:text-2xl">Which organelle is responsible for ATP production in eukaryotic cells?</h3><div className="mt-6 space-y-2.5">{["Ribosome","Mitochondria","Golgi apparatus","Endoplasmic reticulum"].map((x,i)=><div key={x} className={i===1?"flex items-center gap-3 rounded-xl border-2 border-[#5c2ac6] bg-white p-3 text-sm font-bold":"flex items-center gap-3 rounded-xl border border-[#ddd8cf] bg-white p-3 text-sm"}><span className={i===1?"grid h-7 w-7 place-items-center rounded-lg bg-[#5c2ac6] text-xs text-white":"grid h-7 w-7 place-items-center rounded-lg bg-[#f3f0e9] text-xs font-bold"}>{String.fromCharCode(65+i)}</span>{x}{i===1&&<Check className="ml-auto h-4 w-4 text-[#5c2ac6]"/>}</div>)}</div><div className="mt-5 flex items-center justify-between rounded-xl bg-[#1d2020] p-4 text-white"><div><p className="text-[10px] uppercase tracking-widest text-white/40">Your accuracy</p><p className="mt-1 text-2xl font-extrabold">84%</p></div><div className="h-12 w-12 rounded-full border-4 border-[#c3ff3d] border-r-transparent" /></div></div></div>
          <div className="absolute -bottom-5 -left-4 hidden rounded-2xl bg-[#c3ff3d] px-5 py-4 shadow-xl sm:block"><p className="text-[10px] font-bold uppercase tracking-widest">Daily goal</p><p className="mt-1 text-xl font-extrabold">20 questions</p></div>
        </div>
      </div>
    </section>

    <section id="exams" className="border-y border-[#dfd9d0] bg-white"><div className="mx-auto max-w-7xl px-5 py-8 lg:px-8"><div className="flex flex-wrap items-center gap-x-7 gap-y-3"><span className="eyebrow text-[#9a978f]">Prepare for</span>{exams.map(e=><span key={e} className="text-sm font-extrabold tracking-tight text-[#4e504e]">{e}</span>)}</div></div></section>

    <section id="why" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="max-w-2xl"><p className="eyebrow text-[#5c2ac6]">Built for real preparation</p><h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Less dashboard. More learning.</h2><p className="mt-5 text-[#696a67]">Every part of the product has one job: help you make better progress toward your exam.</p></div><div className="mt-12 grid gap-4 md:grid-cols-3">{features.map((f,i)=><article key={f.title} className="surface pressable p-7"><div className={i===1?"mb-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c3ff3d]":"mb-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3f0e9] text-[#5c2ac6]"}><f.icon className="h-5 w-5" /></div><p className="eyebrow text-[#aaa69d]">0{i+1}</p><h3 className="mt-3 text-xl font-extrabold">{f.title}</h3><p className="mt-3 text-sm leading-6 text-[#696a67]">{f.text}</p></article>)}</div></section>

    <section id="how" className="bg-[#5c2ac6] px-5 py-20 text-white lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><p className="eyebrow text-[#c3ff3d]">How it works</p><h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">A simpler way to prepare.</h2></div><div className="grid gap-8 sm:grid-cols-3">{[["01","Choose","Pick the exam and syllabus you are targeting."],["02","Practice","Solve focused questions and use your own material."],["03","Improve","Review mistakes, track accuracy and repeat." ]].map(([n,t,d])=><div key={n} className="border-t border-white/20 pt-5"><span className="text-sm font-bold text-[#c3ff3d]">{n}</span><h3 className="mt-7 text-xl font-extrabold">{t}</h3><p className="mt-3 text-sm leading-6 text-white/65">{d}</p></div>)}</div></div></div></section>

    <section className="mx-auto max-w-4xl px-5 py-20 lg:py-28"><div className="text-center"><p className="eyebrow text-[#5c2ac6]">Questions</p><h2 className="mt-4 text-4xl font-extrabold tracking-tight">Before you start</h2></div><div className="mt-10 divide-y divide-[#ddd8cf]">{faqs.map(([q,a])=><details key={q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold">{q}<ChevronDown className="h-5 w-5 transition group-open:rotate-180" /></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-[#696a67]">{a}</p></details>)}</div></section>

    <section className="px-5 pb-20 lg:px-8 lg:pb-28"><div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#c3ff3d] p-8 sm:p-12 lg:p-16"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="eyebrow">Your next step</p><h2 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">Turn today's hour into tomorrow's confidence.</h2></div><Link href="/tests" className="inline-flex items-center justify-center rounded-full bg-[#1d2020] px-6 py-3.5 text-sm font-bold text-white">Start practicing <ArrowRight className="ml-2 h-4 w-4" /></Link></div></div></section>
    <Footer />
  </main>
}
