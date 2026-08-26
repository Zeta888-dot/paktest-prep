"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { loadSettings } from "@/lib/settings"

type Post = {
  id: string
  author: string
  title: string
  body: string
  createdAt: string
}

export default function ForumPage() {
  const [list, setList] = useState<Post[]>([])
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [posting, setPosting] = useState(false)

  async function refresh() {
    const d = await (await fetch("/api/forum")).json()
    setList(d.posts ?? [])
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handlePost() {
    if (!title.trim() || !body.trim()) return
    setPosting(true)
    await fetch("/api/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: loadSettings().displayName, title, body }),
    })
    setTitle("")
    setBody("")
    setPosting(false)
    refresh()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Forum</h1>
        <p className="mt-1 text-muted-foreground">Discuss preparation tips with other aspirants.</p>
      </div>

      <section className="space-y-3 rounded-lg border border-border bg-card p-6">
        <h2 className="font-medium text-card-foreground">Start a Discussion</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your question or tip..."
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
        <Button onClick={handlePost} disabled={posting}>
          {posting ? "Posting..." : "Post"}
        </Button>
      </section>

      <section className="space-y-3">
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">No discussions yet. Start the first one!</p>
        )}
        {list.map((p) => (
          <div key={p.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="font-medium text-card-foreground">{p.author}</span>
              <span>{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
            <h3 className="mt-2 font-medium text-card-foreground">{p.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}