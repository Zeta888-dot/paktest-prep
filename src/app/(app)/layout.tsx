"use client"

import { useState } from "react"
import { Menu, GraduationCap } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground md:flex-row">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
        <div className="flex items-center gap-2 font-semibold">
          <GraduationCap className="h-5 w-5" />
          PakTest Prep
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="hidden h-full md:block">
        <Sidebar />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-60">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
    </div>
  )
}