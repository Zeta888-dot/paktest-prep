"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import { loadSettings, saveSettings, type Settings } from "@/lib/settings"
import {
  User,
  SlidersHorizontal,
  Moon,
  Sun,
  Monitor,
  Download,
  Trash2,
  AlertTriangle,
  FileX,
  Check,
  Loader2,
  Palette,
  Database,
  BookOpen,
  FolderOpen,
} from "lucide-react"

type Theme = "dark" | "light" | "system"

const questionOptions = [
  { value: 5, label: "5 questions", icon: BookOpen },
  { value: 10, label: "10 questions", icon: BookOpen },
  { value: 15, label: "15 questions", icon: BookOpen },
  { value: 20, label: "20 questions", icon: BookOpen },
  { value: 25, label: "25 questions", icon: BookOpen },
]

const sourceOptions = [
  { value: "syllabus", label: "From Syllabus", icon: BookOpen },
  { value: "material", label: "From My Material", icon: FolderOpen },
]

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>({
    displayName: "",
    questionsPerTest: 5,
    defaultSource: "syllabus",
  })
  const [saved, setSaved] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [theme, setTheme] = useState<Theme>("dark")
  const [exporting, setExporting] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    setForm(loadSettings())
    const t = (localStorage.getItem("theme") as Theme) || "dark"
    setTheme(t)
  }, [])

  function handleSave() {
    saveSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function setThemeValue(t: Theme) {
    setTheme(t)
    localStorage.setItem("theme", t)
    const html = document.documentElement
    if (t === "dark") html.classList.add("dark")
    else if (t === "light") html.classList.remove("dark")
    else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      prefersDark ? html.classList.add("dark") : html.classList.remove("dark")
    }
  }

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch("/api/history")
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data.history ?? [], null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `paktest-history-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert("Failed to export history.")
    } finally {
      setExporting(false)
    }
  }

  async function handleReset() {
    if (!confirm("This will delete ALL local data including settings, likes, replies, and theme preference. This cannot be undone. Continue?")) return
    setResetting(true)
    localStorage.clear()
    await fetch("/api/clear-material", { method: "POST" })
    setResetting(false)
    window.location.reload()
  }

  async function handleClear() {
    if (!confirm("Delete all uploaded material and generated chunks?")) return
    setClearing(true)
    await fetch("/api/clear-material", { method: "POST" })
    setClearing(false)
    alert("All material deleted.")
  }

  const themeOptions = [
    { value: "dark" as Theme, label: "Dark", icon: Moon },
    { value: "light" as Theme, label: "Light", icon: Sun },
    { value: "system" as Theme, label: "System", icon: Monitor },
  ]

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and practice preferences.</p>
      </div>

      {/* Profile */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-card-foreground">Profile</h2>
        </div>
        <label className="block text-sm text-muted-foreground">
          Display name
          <input
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            placeholder="e.g. Zahi"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
        </label>
      </section>

      {/* Practice Preferences */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-card-foreground">Practice Preferences</h2>
        </div>
        <div className="space-y-4">
          <label className="block text-sm text-muted-foreground">
            Questions per test
            <div className="mt-1.5">
              <CustomSelect
                value={form.questionsPerTest}
                onChange={(v) => setForm({ ...form, questionsPerTest: v })}
                options={questionOptions}
              />
            </div>
          </label>
          <label className="block text-sm text-muted-foreground">
            Default question source
            <div className="mt-1.5">
              <CustomSelect
                value={form.defaultSource}
                onChange={(v) => setForm({ ...form, defaultSource: v as "syllabus" | "material" })}
                options={sourceOptions}
              />
            </div>
          </label>
        </div>
      </section>

      {/* Appearance */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Palette className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-card-foreground">Appearance</h2>
        </div>
        <div className="flex gap-2">
          {themeOptions.map((opt) => {
            const active = theme === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setThemeValue(opt.value)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <opt.icon className="h-4 w-4" />
                {opt.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Data */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Database className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-card-foreground">Data</h2>
        </div>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={exporting}
          className="gap-2"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export History
        </Button>
      </section>

      <Button onClick={handleSave} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
        {saved ? <Check className="h-4 w-4" /> : null}
        {saved ? "Saved!" : "Save Changes"}
      </Button>

      {/* Danger Zone */}
      <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/10">
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <h2 className="text-sm font-semibold text-red-500">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-card-foreground">Delete All Material</p>
              <p className="text-xs text-muted-foreground">Remove uploaded PDFs, images and chunks.</p>
            </div>
            <Button
              variant="outline"
              className="gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
              onClick={handleClear}
              disabled={clearing}
            >
              <FileX className="h-4 w-4" />
              {clearing ? "Deleting..." : "Delete"}
            </Button>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-card-foreground">Reset All Data</p>
                <p className="text-xs text-muted-foreground">Clear settings, history, likes, replies, everything.</p>
              </div>
              <Button
                variant="outline"
                className="gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                onClick={handleReset}
                disabled={resetting}
              >
                <Trash2 className="h-4 w-4" />
                {resetting ? "Resetting..." : "Reset"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}