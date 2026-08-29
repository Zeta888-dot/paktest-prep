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
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, hover: "group-hover:scale-110 group-hover:-translate-y-0.5" },
  { label: "Practice Tests", href: "/tests", icon: FileText, hover: "group-hover:rotate-6 group-hover:scale-110" },
  { label: "Saved Questions", href: "/saved", icon: Bookmark, hover: "group-hover:scale-125 group-hover:text-yellow-400" },
  { label: "Upload Material", href: "/upload", icon: Upload, hover: "group-hover:-translate-y-1 group-hover:scale-110" },
  { label: "Forum", href: "/forum", icon: MessagesSquare, hover: "group-hover:scale-110 group-hover:-translate-x-0.5" },
  { label: "Settings", href: "/settings", icon: Settings, hover: "group-hover:rotate-90" },
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
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-sidebar p-3">
      <Link
        href="/"
        className="group mb-6 flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 transition-all hover:bg-accent"
      >
        <div className="rounded-lg bg-primary/10 p-2 text-primary transition-transform group-hover:scale-110">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold text-foreground">PakTest Prep</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary"
                    : "bg-transparent text-muted-foreground group-hover:bg-primary/5 group-hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4 transition-all duration-300", item.hover)} />
              </div>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                {item.label}
              </span>
              {active && (
                <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-2 px-1 pt-6">
        {status === "authenticated" && session.user ? (
          <div className="group relative rounded-lg border border-border p-2 transition-all hover:bg-accent">
            <div className="flex items-center gap-2.5">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="h-8 w-8 rounded-full ring-2 ring-transparent transition-all group-hover:ring-primary/20"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary ring-2 ring-transparent transition-all group-hover:ring-primary/20">
                  {(session.user.name ?? "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground transition-transform group-hover:translate-x-0.5">
                  {session.user.name}
                </div>
                <div className="truncate text-[11px] text-muted-foreground">{session.user.email}</div>
              </div>
              <button
                onClick={() => signOut()}
                title="Sign out"
                className="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="group flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <LogOut className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:rotate-0" />
            </div>
            <span className="transition-transform group-hover:translate-x-0.5">Sign in with Google</span>
          </button>
        )}

        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          {themeOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => applyTheme(t.value)}
              title={t.label}
              className={cn(
                "flex flex-1 items-center justify-center rounded-md py-1.5 transition-all duration-200",
                theme === t.value
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <t.icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="px-2 pb-1 text-[11px] text-muted-foreground">© 2026 PakTest Prep</div>
      </div>
    </aside>
  )
}