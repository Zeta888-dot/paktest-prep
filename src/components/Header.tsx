"use client"

import { useState } from "react"
import Link from "next/link"
import { GraduationCap, Menu, X } from "lucide-react"

const navLinks = [
  { label: "Practice", href: "/tests" },
  { label: "Upload Notes", href: "/upload" },
  { label: "Community", href: "/forum" },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-4 z-30 px-4">
      <div className="relative mx-auto flex max-w-4xl items-center justify-between">
        {/* Logo — sits outside the capsule */}
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0a0a0f]/80 px-3 py-2 text-sm font-semibold backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20">
            <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <span className="hidden sm:inline">PakTest Prep</span>
        </Link>

        {/* Floating capsule nav — desktop only */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-[#0a0a0f]/80 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-white/90 active:scale-95"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0a0a0f]/80 text-white/70 backdrop-blur-md transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 md:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu — drops from the capsule */}
      {open && (
        <div className="mx-auto mt-2 max-w-4xl rounded-2xl border border-white/10 bg-[#0a0a0f]/95 p-4 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black transition active:scale-95"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  )
}