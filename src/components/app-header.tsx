"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  FileText,
  Bookmark,
  Upload,
  MessagesSquare,
  GraduationCap,
  Command,
  X,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const pageMap: Record<string, { title: string; icon: React.ElementType }> = {
  "/dashboard": { title: "Dashboard", icon: LayoutDashboard },
  "/tests": { title: "Practice Tests", icon: FileText },
  "/saved": { title: "Saved Questions", icon: Bookmark },
  "/upload": { title: "Upload Material", icon: Upload },
  "/forum": { title: "Forum", icon: MessagesSquare },
  "/settings": { title: "Settings", icon: Settings },
}

function getPageInfo(path: string) {
  if (pageMap[path]) return pageMap[path]
  if (path.startsWith("/tests/")) {
    const testName = decodeURIComponent(path.replace("/tests/", "").split("/")[0])
    return { title: testName || "Practice Studio", icon: FileText }
  }
  return { title: "PakTest Prep", icon: GraduationCap }
}

/* ── Command Palette ── */
function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        open ? onClose() : null
      }
      if (e.key === "Escape" && open) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const items = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Practice Tests", href: "/tests", icon: FileText },
    { label: "Saved Questions", href: "/saved", icon: Bookmark },
    { label: "Upload Material", href: "/upload", icon: Upload },
    { label: "Forum", href: "/forum", icon: MessagesSquare },
    { label: "Settings", href: "/settings", icon: Settings },
  ].filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, tests, commands..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">No results found.</div>
          ) : (
            items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition hover:bg-accent"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{item.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↑↓</kbd> to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↵</kbd> to select
          </span>
        </div>
      </div>
    </>
  )
}

/* ── User Dropdown ── */
function UserDropdown() {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const name = session?.user?.name ?? "Guest"
  const email = session?.user?.email ?? ""
  const initial = name.charAt(0).toUpperCase()
  const image = session?.user?.image

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-accent"
      >
        {image ? (
          <img src={image} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {initial}
          </div>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="border-b border-border px-3 py-3">
            <div className="text-sm font-medium text-foreground">{name}</div>
            {email && <div className="mt-0.5 text-[11px] text-muted-foreground">{email}</div>}
          </div>
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-500 transition hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Header ── */
export function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname()
  const [cmdOpen, setCmdOpen] = useState(false)
  const { data: session } = useSession()
  const page = getPageInfo(pathname)
  const PageIcon = page.icon

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCmdOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="hidden md:flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <PageIcon className="h-4 w-4" />
            </div>
            <h1 className="truncate text-sm font-semibold text-foreground">{page.title}</h1>
          </div>
        </div>

        {/* Center - Search */}
        <button
          onClick={() => setCmdOpen(true)}
          className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition hover:border-foreground/20 hover:text-foreground"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs">Search</span>
          <kbd className="ml-2 hidden rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-mono lg:inline-block">
            <Command className="inline h-2.5 w-2.5" />K
          </kbd>
        </button>

        {/* Right */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setCmdOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground md:hidden"
          >
            <Search className="h-4 w-4" />
          </button>

          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>

          <div className="ml-1 h-5 w-px bg-border" />

          {session?.user ? (
            <UserDropdown />
          ) : (
            <Link
              href="/api/auth/signin"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  )
}