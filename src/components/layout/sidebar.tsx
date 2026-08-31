"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import {
  LayoutDashboard,
  FileText,
  Upload,
  MessagesSquare,
  Settings,
  GraduationCap,
  Bookmark,
  Sun,
  Moon,
  Monitor,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Practice Tests", href: "/tests", icon: FileText },
  { label: "Saved Questions", href: "/saved", icon: Bookmark },
  { label: "Upload Material", href: "/upload", icon: Upload },
  { label: "Forum", href: "/forum", icon: MessagesSquare },
  { label: "Settings", href: "/settings", icon: Settings },
]

const themeOptions = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const [theme, setTheme] = useState("dark")
  const { data: session, status } = useSession()

  useEffect(() => {
    setTheme(localStorage.getItem("theme") || "dark")
  }, [])

  function applyTheme(t: string) {
    localStorage.setItem("theme", t)
    const dark =
      t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.classList.toggle("dark", dark)
    setTheme(t)
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-sidebar">
      {/* Logo */}
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2.5 px-4 py-4 transition hover:bg-accent/50"
      >
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="text-base font-semibold text-foreground">PakTest Prep</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <span>{item.label}</span>
              {active && (
                <div className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-3 px-3 pb-3 pt-6">
        {/* User / Sign in */}
        {status === "authenticated" && session.user ? (
          <div className="rounded-lg border border-border p-2.5">
            <div className="flex items-center gap-2.5">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {(session.user.name ?? "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {session.user.name}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">{session.user.email}</div>
              </div>
              <button
                onClick={() => signOut()}
                title="Sign out"
                className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="flex w-full items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <LogOut className="h-4 w-4 rotate-180" />
            </div>
            <span>Sign in with Google</span>
          </button>
        )}

        {/* Theme toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          {themeOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => applyTheme(t.value)}
              title={t.label}
              className={cn(
                "flex flex-1 items-center justify-center rounded-md py-1.5 text-xs font-medium transition",
                theme === t.value
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <t.icon className="h-3.5 w-3.5 mr-1" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-1 text-[10px] text-muted-foreground/60">© 2026 PakTest Prep</div>
      </div>
    </aside>
  )
}