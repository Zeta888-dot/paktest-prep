"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"
import { ArrowRight, Check, GraduationCap, Sparkles } from "lucide-react"

const benefits = ["Practice tests built around Pakistani exams", "AI-powered MCQs from your own notes", "Progress tracking that shows what to improve"]

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#f3f0e9] text-[#1d2020] lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#5c2ac6] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#c3ff3d]" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border-[70px] border-white/10" />
        <Link href="/" className="relative z-10 flex items-center gap-3 font-bold tracking-tight">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#c3ff3d] text-[#1d2020]"><GraduationCap className="h-6 w-6" /></span>
          <span className="text-xl">PakTest Prep</span>
        </Link>
        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold"><Sparkles className="h-3.5 w-3.5 text-[#c3ff3d]" /> Built for ambitious Pakistani aspirants</div>
          <h1 className="display-heading text-6xl xl:text-7xl">Prepare with purpose. <span className="text-[#c3ff3d]">Pass with confidence.</span></h1>
          <p className="mt-7 max-w-lg text-base leading-7 text-white/75">One focused place for competitive-test practice, AI-assisted study and measurable progress.</p>
          <div className="mt-9 space-y-4">
            {benefits.map((item) => <div key={item} className="flex items-center gap-3 text-sm"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c3ff3d] text-[#1d2020]"><Check className="h-3.5 w-3.5" /></span>{item}</div>)}
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/50">© 2026 PakTest Prep</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-12 flex items-center gap-2 font-bold lg:hidden"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5c2ac6] text-white"><GraduationCap className="h-5 w-5" /></span>PakTest Prep</Link>
          <div className="mb-8">
            <p className="eyebrow text-[#5c2ac6]">Welcome back</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight">Ready to get back to work?</h2>
            <p className="mt-3 text-sm leading-6 text-[#696a67]">Sign in to continue your preparation and keep your progress in one place.</p>
          </div>
          <div className="surface soft-shadow p-6 sm:p-8">
            <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="pressable flex w-full items-center justify-center gap-3 rounded-xl border border-[#dcd7cd] bg-white px-5 py-3.5 text-sm font-semibold text-[#1d2020] shadow-sm hover:border-[#5c2ac6]/40 hover:bg-[#faf9f6]">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-[#e4e1da] bg-white text-sm font-bold">G</span>
              Continue with Google
              <ArrowRight className="ml-auto h-4 w-4 text-[#5c2ac6]" />
            </button>
            <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-[#e5e1d8]" /><span className="text-[11px] font-semibold uppercase tracking-widest text-[#9a978f]">Secure access</span><div className="h-px flex-1 bg-[#e5e1d8]" /></div>
            <div className="rounded-xl bg-[#f3f0e9] p-4 text-xs leading-5 text-[#696a67]">Your account keeps your test history, saved questions, streaks and personalized preparation data together.</div>
          </div>
          <p className="mt-6 text-center text-xs leading-5 text-[#696a67]">By continuing, you agree to use PakTest Prep responsibly for your exam preparation.</p>
        </div>
      </section>
    </main>
  )
}
