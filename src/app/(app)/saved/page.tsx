"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { loadBookmarks, saveBookmarks, type SavedQuestion } from "@/lib/bookmarks"
import { Bookmark, Trash2, ArrowRight } from "lucide-react"

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ]
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`
  }
  return "Just now"
}

export default function SavedPage() {
  const router = useRouter()
  const [list, setList] = useState<SavedQuestion[]>([])

  useEffect(() => {
    setList(loadBookmarks())
  }, [])

  function remove(id: string) {
    const next = list.filter((b) => b.id !== id)
    saveBookmarks(next)
    setList(next)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Saved Questions</h1>
        <p className="mt-2 text-muted-foreground">Review the questions you bookmarked during practice.</p>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <Bookmark className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No saved questions yet.</p>
          <Button onClick={() => router.push("/tests")} className="mt-4 gap-2">
            Browse Tests <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((b) => (
            <div
              key={b.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card px-5 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-card-foreground">{b.question}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5">{b.test}</span>
                  <span>{timeAgo(b.savedAt)}</span>
                </div>
              </div>
              <button
                onClick={() => remove(b.id)}
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}