"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  ChevronRight,
  Flame,
  History,
  Clock,
  Star,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ── Test data for search ── */
const allTests = [
  { name: "Police Constable (KPK / Islamabad)", category: "Defense & Police" },
  { name: "Junior / Senior Clerk", category: "Clerical & Admin" },
  { name: "Stenotypist", category: "Clerical & Admin" },
  { name: "ASF", category: "Defense & Police" },
  { name: "Air Force Commission Posts", category: "Defense & Police" },
  { name: "MDCAT", category: "Medical & Engineering" },
  { name: "ECAT", category: "Medical & Engineering" },
  { name: "SST (Senior Subject Specialist)", category: "Teaching" },
  { name: "CT (Certified Teacher)", category: "Teaching" },
  { name: "PST (Primary School Teacher)", category: "Teaching" },
  { name: "PASI (Assistant Sub Inspector)", category: "Defense & Police" },
  { name: "CSS & PMS", category: "Civil Services" },
]

const pageMap: Record<string, { title: string; icon: React.ElementType; parent?: string }> = {
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
    const parts = path.replace("/tests/", "").split("/")
    const testName = decodeURIComponent(parts[0])
    return { title: testName || "Practice Studio", icon: FileText, parent: "/tests" }
  }
  return { title: "PakTest Prep", icon: GraduationCap }
}

/* ── Command Palette ── */
function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onClose()
      }
      if (e.key === "Escape" && open) onClose()
      if (!open) return

      const items = filteredItems
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % items.length)
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + items.length) % items.length)
      }
      if (e.key === "Enter" && items[selectedIndex]) {
        e.preventDefault()
        const item = items[selectedIndex]
        if ("href" in item) router.push(item.href)
        else router.push(`/tests/${encodeURIComponent(item.name)}`)
        onClose()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose, router, selectedIndex])

  const pageItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Practice Tests", href: "/tests", icon: FileText },
    { label: "Saved Questions", href: "/saved", icon: Bookmark },
    { label: "Upload Material", href: "/upload", icon: Upload },
    { label: "Forum", href: "/forum", icon: MessagesSquare },
    { label: "Settings", href: "/settings", icon: Settings },
  ].filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))

  const testItems = allTests.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  )

  const filteredItems = query.length > 0
    ? [...pageItems, ...testItems]
    : pageItems

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div className="fixed left-1/2 top-[12%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
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
        <div className="max-h-80 overflow-y-auto py-1">
          {filteredItems.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">No results found.</p>
              <p className="text-xs text-muted-foreground/70">Try a different search term.</p>
            </div>
          ) : (
            <>
              {pageItems.length > 0 && (
                <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Pages
                </div>
              )}
              {pageItems.map((item, idx) => {
                const isSelected = selectedIndex === idx
                return (
                  <button
                    key={item.href}
                    onClick={() => { router.push(item.href); onClose() }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition",
                      isSelected ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    <ArrowRight className={cn("h-3.5 w-3.5 shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                  </button>
                )
              })}

              {testItems.length > 0 && (
                <div className="mt-1 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tests
                </div>
              )}
              {testItems.map((item, idx) => {
                const actualIdx = pageItems.length + idx
                const isSelected = selectedIndex === actualIdx
                return (
                  <button
                    key={item.name}
                    onClick={() => { router.push(`/tests/${encodeURIComponent(item.name)}`); onClose() }}
                    onMouseEnter={() => setSelectedIndex(actualIdx)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition",
                      isSelected ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"
                    )}
                  >
                    <Target className="h-4 w-4 shrink-0" />
                    <div className="flex-1">
                      <div>{item.name}</div>
                      <div className="text-[11px] text-muted-foreground/70">{item.category}</div>
                    </div>
                    <ArrowRight className={cn("h-3.5 w-3.5 shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                  </button>
                )
              })}
            </>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">↵</kbd> select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono">esc</kbd> close
          </span>
        </div>
      </div>
    </>
  )
}

/* ── Notification Dropdown ── */
function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [unread] = useState(2)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const notifications = [
    { id: 1, title: "New syllabus added", desc: "Police Constable syllabus is now complete.", time: "2h ago", read: false },
    { id: 2, title: "Practice reminder", desc: "You haven't practiced in 2 days. Keep the streak alive!", time: "1d ago", read: false },
    { id: 3, title: "Weekly report", desc: "You attempted 45 questions this week with 78% accuracy.", time: "3d ago", read: true },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            <span className="text-[10px] text-muted-foreground">{unread} unread</span>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.map((n) => (
              <button
                key={n.id}
                className="flex w-full gap-3 px-4 py-3 text-left transition hover:bg-accent/50"
              >
                <div className={cn(
                  "mt-0.5 h-2 w-2 shrink-0 rounded-full",
                  n.read ? "bg-muted" : "bg-primary"
                )} />
                <div className="flex-1">
                  <div className="text-sm text-foreground">{n.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{n.desc}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground/70">{n.time}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
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

/* ── Breadcrumbs ── */
function Breadcrumbs({ path }: { path: string }) {
  const info = getPageInfo(path)
  if (!info.parent) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden md:flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <info.icon className="h-4 w-4" />
        </div>
        <h1 className="text-sm font-semibold text-foreground">{info.title}</h1>
      </div>
    )
  }

  const parentInfo = pageMap[info.parent]

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="hidden md:flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
        <info.icon className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1.5 min-w-0">
        <Link
          href={info.parent}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          {parentInfo?.title ?? "Tests"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <h1 className="truncate text-sm font-semibold text-foreground">{info.title}</h1>
      </div>
    </div>
  )
}

/* ── Streak Badge ── */
function StreakBadge() {
  const [streak] = useState(5)
  if (streak < 1) return null

  return (
    <div className="hidden items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 sm:flex">
      <Flame className="h-3.5 w-3.5 text-amber-500" />
      <span className="text-xs font-medium text-foreground">{streak}</span>
      <span className="text-[10px] text-muted-foreground">day streak</span>
    </div>
  )
}

/* ── Main Header ── */
export function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname()
  const [cmdOpen, setCmdOpen] = useState(false)
  const { data: session } = useSession()

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
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-card px-3 md:px-5">
        {/* Left: Menu + Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onMenuClick}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Breadcrumbs path={pathname} />
        </div>

        {/* Center: Search */}
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

        {/* Right: Streak + Bell + User */}
        <div className="flex items-center gap-1 shrink-0">
          <StreakBadge />

          <button
            onClick={() => setCmdOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground md:hidden"
          >
            <Search className="h-4 w-4" />
          </button>

          <NotificationBell />

          <div className="mx-1 hidden h-5 w-px bg-border sm:block" />

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