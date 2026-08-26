"use client"

import { useRouter } from "next/navigation"

const tests = [
  "Police Constable (KPK / Islamabad)",
  "Junior / Senior Clerk",
  "Stenotypist",
  "ASF",
  "Air Force Commission Posts",
  "MDCAT",
  "ECAT",
  "SST (Senior Subject Specialist)",
  "CT (Certified Teacher)",
  "PST (Primary School Teacher)",
  "PASI (Assistant Sub Inspector)",
  "CSS & PMS",
]

export default function TestsPage() {
  const router = useRouter()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Practice Tests</h1>
      <p className="mt-2 text-muted-foreground">Select your target test to generate MCQs.</p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tests.map((t) => (
          <button
            key={t}
            onClick={() => router.push(`/tests/${encodeURIComponent(t)}`)}
            className="rounded-lg border border-border bg-card p-4 text-left text-sm text-card-foreground transition-colors hover:border-primary hover:bg-accent"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}