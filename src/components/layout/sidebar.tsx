"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { LayoutDashboard, FileText, Upload, MessagesSquare, Settings, GraduationCap, Bookmark, LogOut, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Practice tests", href: "/tests", icon: FileText },
  { label: "Saved questions", href: "/saved", icon: Bookmark },
  { label: "Study material", href: "/upload", icon: Upload },
  { label: "Community", href: "/forum", icon: MessagesSquare },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-[#e5e1d8] bg-white px-3 py-4 text-[#1d2020]">
      <Link href="/" onClick={onNavigate} className="mb-7 flex items-center gap-3 px-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5c2ac6] text-white shadow-sm"><GraduationCap className="h-5 w-5" /></span>
        <span><span className="block text-[15px] font-extrabold tracking-tight">PakTest Prep</span><span className="block text-[10px] font-semibold uppercase tracking-widest text-[#9a978f]">Study smarter</span></span>
      </Link>

      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#aaa69d]">Workspace</p>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          return <Link key={item.href} href={item.href} onClick={onNavigate} className={cn("group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all", active ? "bg-[#f3f0e9] text-[#5c2ac6]" : "text-[#6f706c] hover:bg-[#f7f5f0] hover:text-[#1d2020]")}>
            <item.icon className={cn("h-[17px] w-[17px]", active ? "text-[#5c2ac6]" : "text-[#8b8983] group-hover:text-[#1d2020]")} />
            {item.label}
            {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#5c2ac6]" />}
          </Link>
        })}
      </nav>

      <div className="mt-8 rounded-2xl bg-[#5c2ac6] p-4 text-white">
        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#c3ff3d] text-[#1d2020]"><Sparkles className="h-4 w-4" /></div>
        <p className="text-sm font-bold">Keep your streak alive</p>
        <p className="mt-1 text-[11px] leading-5 text-white/70">A little practice every day compounds into exam confidence.</p>
        <Link href="/tests" onClick={onNavigate} className="mt-3 inline-flex rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-[#5c2ac6]">Practice now</Link>
      </div>

      <div className="mt-auto space-y-2 pt-6">
        <Link href="/settings" onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#6f706c] hover:bg-[#f7f5f0] hover:text-[#1d2020]"><Settings className="h-[17px] w-[17px]" />Settings</Link>
        {status === "authenticated" && session?.user ? <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#e5e1d8] bg-[#faf9f6] p-2.5">
          {session.user.image ? <img src={session.user.image} alt="" className="h-8 w-8 rounded-full" /> : <div className="grid h-8 w-8 place-items-center rounded-full bg-[#c3ff3d] text-xs font-bold">{(session.user.name ?? "U")[0]}</div>}
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{session.user.name}</p><p className="truncate text-[10px] text-[#8b8983]">{session.user.email}</p></div>
          <button onClick={() => signOut()} className="rounded-lg p-1.5 text-[#8b8983] hover:bg-white hover:text-[#c83f3f]"><LogOut className="h-4 w-4" /></button>
        </div> : <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="flex w-full items-center justify-center rounded-xl bg-[#1d2020] px-3 py-2.5 text-xs font-bold text-white hover:bg-[#303333]">Sign in to save progress</button>}
        <p className="px-1 pt-2 text-[9px] text-[#aaa69d]">© 2026 PakTest Prep</p>
      </div>
    </aside>
  )
}
