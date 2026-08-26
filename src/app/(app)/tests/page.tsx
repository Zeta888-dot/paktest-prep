"use client"

import { useRouter } from "next/navigation"
import {
  Shield,
  FileText,
  Keyboard,
  Plane,
  HeartPulse,
  Cog,
  GraduationCap,
  BookOpen,
  School,
  BadgeCheck,
  Landmark,
  ArrowUpRight,
} from "lucide-react"

const tests = [
  { name: "Police Constable (KPK / Islamabad)", icon: Shield, color: "bg-blue-400/10 text-blue-400" },
  { name: "Junior / Senior Clerk", icon: FileText, color: "bg-amber-400/10 text-amber-400" },
  { name: "Stenotypist", icon: Keyboard, color: "bg-pink-400/10 text-pink-400" },
  { name: "ASF", icon: Shield, color: "bg-cyan-400/10 text-cyan-400" },
  { name: "Air Force Commission Posts", icon: Plane, color: "bg-sky-400/10 text-sky-400" },
  { name: "MDCAT", icon: HeartPulse, color: "bg-red-400/10 text-red-400" },
  { name: "ECAT", icon: Cog, color: "bg-orange-400/10 text-orange-400" },
  { name: "SST (Senior Subject Specialist)", icon: GraduationCap, color: "bg-purple-400/10 text-purple-400" },
  { name: "CT (Certified Teacher)", icon: BookOpen, color: "bg-emerald-400/10 text-emerald-400" },
  { name: "PST (Primary School Teacher)", icon: School, color: "bg-teal-400/10 text-teal-400" },
  { name: "PASI (Assistant Sub Inspector)", icon: BadgeCheck, color: "bg-indigo-400/10 text-indigo-400" },
  { name: "CSS & PMS", icon: Landmark, color: "bg-yellow-400/10 text-yellow-400" },
]

export default function TestsPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Practice Tests</h1>
        <p className="mt-2 text-white/50">Select your target test to generate MCQs.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tests.map((t) => (
          <button
            key={t.name}
            onClick={() => router.push(`/tests/${encodeURIComponent(t.name)}`)}
            className="group flex items-start justify-between rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06]"
          >
            <div>
              <span className={`inline-block rounded-lg p-2 ${t.color}`}>
                <t.icon className="h-4 w-4" />
              </span>
              <div className="mt-3 text-sm font-medium text-white">{t.name}</div>
              <div className="mt-1 text-xs text-white/40">Generate MCQs</div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-white/20 transition group-hover:text-white" />
          </button>
        ))}
      </div>
    </div>
  )
}