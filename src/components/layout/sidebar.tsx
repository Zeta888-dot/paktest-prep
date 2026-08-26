import Link from "next/link"
import { LayoutDashboard, FileText, Upload, MessagesSquare, Settings } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Practice Tests", href: "/tests", icon: FileText },
  { label: "Upload Material", href: "/upload", icon: Upload },
  { label: "Forum", href: "/forum", icon: MessagesSquare },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-sidebar p-4">
      <div className="mb-8 px-2 text-lg font-semibold text-primary">PakTest Prep</div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}