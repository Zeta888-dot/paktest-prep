"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { loadSettings, saveSettings, type Settings } from "@/lib/settings"

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>({ displayName: "", questionsPerTest: 5, defaultSource: "syllabus" })
  const [saved, setSaved] = useState(false)
  const [clearing, setClearing] = useState(false)

  useEffect(() => setForm(loadSettings()), [])

  function handleSave() {
    saveSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleClear() {
    if (!confirm("Delete all uploaded material and generated chunks?")) return
    setClearing(true)
    await fetch("/api/clear-material", { method: "POST" })
    setClearing(false)
    alert("All material deleted.")
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your profile and practice preferences.</p>
      </div>

      <section className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h2 className="font-medium text-card-foreground">Profile</h2>
        <label className="block text-sm text-muted-foreground">
          Display name
          <input
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            placeholder="e.g. Zahi"
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-card p-6">
        <h2 className="font-medium text-card-foreground">Practice Preferences</h2>
        <label className="block text-sm text-muted-foreground">
          Questions per test
          <select
            value={form.questionsPerTest}
            onChange={(e) => setForm({ ...form, questionsPerTest: Number(e.target.value) })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </label>
        <label className="block text-sm text-muted-foreground">
          Default question source
          <select
            value={form.defaultSource}
            onChange={(e) => setForm({ ...form, defaultSource: e.target.value as "syllabus" | "material" })}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="syllabus">From Syllabus</option>
            <option value="material">From My Material</option>
          </select>
        </label>
      </section>

      <Button onClick={handleSave}>{saved ? "Saved" : "Save Changes"}</Button>

      <section className="space-y-3 rounded-lg border border-destructive/40 bg-card p-6">
        <h2 className="font-medium text-destructive">Danger Zone</h2>
        <p className="text-sm text-muted-foreground">Remove all uploaded PDFs, images and their generated chunks.</p>
        <Button
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10"
          onClick={handleClear}
          disabled={clearing}
        >
          {clearing ? "Deleting..." : "Delete All Material"}
        </Button>
      </section>
    </div>
  )
}