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
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-sidebar p-4">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2 text-lg font-semibold text-foreground">
        <GraduationCap className="h-5 w-5" />
        PakTest Prep
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
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto space-y-3 px-2">
        {status === "authenticated" && session.user ? (
          <div className="flex items-center gap-2 rounded-lg border border-border p-2">
            {session.user.image ? (
              <img src={session.user.image} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {(session.user.name ?? "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-foreground">{session.user.name}</div>
              <div className="truncate text-[10px] text-muted-foreground">{session.user.email}</div>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign out"
              className="rounded-md p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            Sign in with Google
          </button>
        )}

        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          {themeOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => applyTheme(t.value)}
              title={t.label}
              className={cn(
                "flex flex-1 items-center justify-center rounded-md py-1.5 transition",
                theme === t.value
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">© 2026 PakTest Prep</div>
      </div>
    </aside>
  )
}