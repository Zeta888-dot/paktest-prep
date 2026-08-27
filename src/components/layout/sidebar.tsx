"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  Upload,
  MessagesSquare,
  Settings,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Practice Tests", href: "/tests", icon: FileText },
  { label: "Upload Material", href: "/upload", icon: Upload },
  { label: "Forum", href: "/forum", icon: MessagesSquare },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

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
      <div className="mt-auto px-3 text-xs text-muted-foreground">© 2026 PakTest Prep</div>
    </aside>
  )
}