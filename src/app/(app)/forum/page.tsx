"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { loadSettings } from "@/lib/settings"
import {
  MessageCircle,
  ThumbsUp,
  Clock,
  Send,
  CornerDownRight,
  Search,
} from "lucide-react"

type Post = {
  id: string
  author: string
  title: string
  body: string
  createdAt: string
}

type Reply = {
  id: string
  author: string
  body: string
  createdAt: string
}

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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function Avatar({ name, className = "" }: { name: string; className?: string }) {
  const colors = [
    "bg-red-400/20 text-red-400",
    "bg-blue-400/20 text-blue-400",
    "bg-emerald-400/20 text-emerald-400",
    "bg-purple-400/20 text-purple-400",
    "bg-amber-400/20 text-amber-400",
    "bg-pink-400/20 text-pink-400",
    "bg-cyan-400/20 text-cyan-400",
  ]
  const color =
    !name || name === "Anonymous"
      ? "bg-emerald-500 text-white"
      : colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${color} ${className}`}>
      {getInitials(name) || "?"}
    </div>
  )
}

export default function ForumPage() {
  const [list, setList] = useState<Post[]>([])
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState("")
  const [replies, setReplies] = useState<Record<string, Reply[]>>({})
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<"new" | "old">("new")

  useEffect(() => {
    refresh()
    const saved = localStorage.getItem("forum-likes")
    if (saved) setLikedPosts(new Set(JSON.parse(saved)))
    const savedReplies = localStorage.getItem("forum-replies")
    if (savedReplies) setReplies(JSON.parse(savedReplies))
  }, [])

  async function refresh() {
    setLoading(true)
    try {
      const d = await (await fetch("/api/forum")).json()
      setList(d.posts ?? [])
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }

  async function handlePost() {
    if (!title.trim() || !body.trim()) return
    setPosting(true)
    try {
      await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: loadSettings().displayName, title, body }),
      })
      setTitle("")
      setBody("")
      refresh()
    } catch {
      // ignore
    } finally {
      setPosting(false)
    }
  }

  function toggleLike(postId: string) {
    setLikedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      localStorage.setItem("forum-likes", JSON.stringify([...next]))
      return next
    })
  }

  function handleReply(postId: string) {
    if (!replyBody.trim()) return
    const newReply: Reply = {
      id: crypto.randomUUID(),
      author: loadSettings().displayName || "Anonymous",
      body: replyBody.trim(),
      createdAt: new Date().toISOString(),
    }
    setReplies((prev) => {
      const next = { ...prev, [postId]: [...(prev[postId] ?? []), newReply] }
      localStorage.setItem("forum-replies", JSON.stringify(next))
      return next
    })
    setReplyBody("")
    setReplyingTo(null)
  }

  const visible = list
    .filter((p) =>
      (p.title + " " + p.body + " " + p.author).toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) =>
      sort === "new"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Forum</h1>
        <p className="mt-1 text-muted-foreground">Discuss preparation tips with other aspirants.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search discussions..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          {(["new", "old"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                sort === s
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {s === "new" ? "Newest" : "Oldest"}
            </button>
          ))}
        </div>
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium text-card-foreground">Start a Discussion</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your question or tip..."
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <Button onClick={handlePost} disabled={posting || !title.trim() || !body.trim()}>
          {posting ? "Posting..." : "Post"}
        </Button>
      </section>

      <section className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                  </div>
                </div>
                <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-12 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              {query ? "No discussions match your search." : "No discussions yet. Start the first one!"}
            </p>
          </div>
        ) : (
          visible.map((p) => {
            const postReplies = replies[p.id] ?? []
            const isLiked = likedPosts.has(p.id)
            return (
              <div key={p.id} className="rounded-xl border border-border bg-card p-5 transition hover:border-border/80">
                <div className="flex items-start gap-3">
                  <Avatar name={p.author} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-card-foreground">{p.author || "Anonymous"}</span>
                      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {timeAgo(p.createdAt)}
                      </span>
                    </div>
                    <h3 className="mt-1 font-semibold text-foreground">{p.title}</h3>
                    <pre className="mt-1 whitespace-pre-wrap font-sans text-sm text-muted-foreground">{p.body}</pre>

                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(p.id)}
                        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                          isLiked
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} />
                        {isLiked ? "Liked" : "Like"}
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === p.id ? null : p.id)}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Reply {postReplies.length > 0 && `(${postReplies.length})`}
                      </button>
                    </div>

                    {replyingTo === p.id && (
                      <div className="mt-3 flex gap-2">
                        <input
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleReply(p.id)}
                          placeholder="Write a reply..."
                          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <Button size="sm" onClick={() => handleReply(p.id)} disabled={!replyBody.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {postReplies.length > 0 && (
                      <div className="mt-3 space-y-3 border-l-2 border-border pl-4">
                        {postReplies.map((r) => (
                          <div key={r.id} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CornerDownRight className="h-3 w-3 text-muted-foreground" />
                              <Avatar name={r.author} className="h-6 w-6 text-[10px]" />
                              <span className="text-xs font-medium text-card-foreground">{r.author}</span>
                              <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                            </div>
                            <p className="pl-5 text-sm text-muted-foreground">{r.body}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </section>
    </div>
  )
}