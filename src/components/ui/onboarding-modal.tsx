"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { loadSettings, saveSettings, defaultSettings, type Settings } from "@/lib/settings"
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
} from "lucide-react"

type Theme = "dark" | "light" | "system"

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>(defaultSettings)
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

  const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: "dark", label: "Dark", icon: Moon },
    { value: "light", label: "Light", icon: Sun },
    { value: "system", label: "System", icon: Monitor },
  ]

  return (
    <div className="max-w-xl space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your profile and practice preferences.</p>
      </div>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium text-card-foreground">Profile</h2>
        </div>
        <label className="block text-sm text-muted-foreground">
          Display name
          <input
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            placeholder="e.g. Zahi"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </label>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium text-card-foreground">Practice Preferences</h2>
        </div>
        <label className="block text-sm text-muted-foreground">
          Questions per test
          <select
            value={form.questionsPerTest}
            onChange={(e) => setForm({ ...form, questionsPerTest: Number(e.target.value) })}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={25}>25</option>
          </select>
        </label>
        <label className="block text-sm text-muted-foreground">
          Default question source
          <select
            value={form.defaultSource}
            onChange={(e) => setForm({ ...form, defaultSource: e.target.value as "syllabus" | "material" })}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="syllabus">From Syllabus</option>
            <option value="material">From My Material</option>
          </select>
        </label>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium text-card-foreground">Appearance</h2>
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
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <opt.icon className="h-4 w-4" />
                {opt.label}
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium text-card-foreground">Data</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
            className="gap-2"
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export History
          </Button>
        </div>
      </section>

      <Button onClick={handleSave} className="gap-2">
        {saved ? <Check className="h-4 w-4" /> : null}
        {saved ? "Saved!" : "Save Changes"}
      </Button>

      <section className="space-y-4 rounded-xl border border-destructive/30 bg-card p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <h2 className="font-medium text-destructive">Danger Zone</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-card-foreground">Delete All Material</p>
              <p className="text-xs text-muted-foreground">Remove uploaded PDFs, images and chunks.</p>
            </div>
            <Button
              variant="outline"
              className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
              onClick={handleClear}
              disabled={clearing}
            >
              <FileX className="h-4 w-4" />
              {clearing ? "Deleting..." : "Delete"}
            </Button>
          </div>

          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-card-foreground">Reset All Data</p>
                <p className="text-xs text-muted-foreground">Clear settings, history, likes, replies — everything.</p>
              </div>
              <Button
                variant="outline"
                className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
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