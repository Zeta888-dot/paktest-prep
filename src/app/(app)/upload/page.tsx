"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Upload,
  FileText,
  ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderOpen,
  ChevronDown,
  Trash2,
} from "lucide-react"

type Doc = {
  id: string
  name: string
  pageCount: number | null
  testName: string | null
  createdAt: string
}

type Chunk = {
  id: string
  content: string
  pageNumber: number | null
}

const testNames = [
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

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
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

function fileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-purple-400" />
  return <FileText className="h-8 w-8 text-blue-400" />
}

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [docs, setDocs] = useState<Doc[]>([])
  const [testName, setTestName] = useState("MDCAT")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [docChunks, setDocChunks] = useState<Record<string, Chunk[]>>({})
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const loadDocs = useCallback(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((d) => setDocs(d.documents ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    loadDocs()
  }, [loadDocs])

  const handleFile = useCallback((f: File | null) => {
    if (!f) return
    const allowed = [".pdf", ".png", ".jpg", ".jpeg", ".webp"]
    const ext = "." + f.name.split(".").pop()?.toLowerCase()
    if (!allowed.includes(ext)) {
      setError("Only PDF, PNG, JPG, JPEG, or WEBP files allowed.")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.")
      return
    }
    setFile(f)
    setError("")
    setMessage("")
  }, [])

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0] ?? null)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setProgress(0)
    setError("")
    setMessage("")

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(interval)
          return 90
        }
        return p + Math.random() * 15
      })
    }, 300)

    const form = new FormData()
    form.append("file", file)
    form.append("testName", testName)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
        signal: controller.signal,
      })
      clearInterval(interval)
      setProgress(100)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setMessage(data.message || "Upload successful!")
      setFile(null)
      loadDocs()
      if (inputRef.current) inputRef.current.value = ""
    } catch (err: any) {
      clearInterval(interval)
      setProgress(0)
      if (err?.name === "AbortError") {
        setError("Upload cancelled.")
      } else {
        setError(err.message || "Upload failed. Please try again.")
      }
    } finally {
      setUploading(false)
      abortRef.current = null
    }
  }

  function cancelUpload() {
    abortRef.current?.abort()
  }

  function clearFile() {
    setFile(null)
    setError("")
    setMessage("")
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ""
  }

  function toggleExpand(id: string) {
    if (expanded === id) {
      setExpanded(null)
      return
    }
    setExpanded(id)
    if (!docChunks[id]) {
      fetch(`/api/chunks?docId=${id}`)
        .then((r) => r.json())
        .then((d) => setDocChunks((prev) => ({ ...prev, [id]: d.chunks ?? [] })))
        .catch(() => {})
    }
  }

  async function deleteDoc(id: string) {
    try {
      await fetch(`/api/documents?id=${id}`, { method: "DELETE" })
      setDocs((prev) => prev.filter((d) => d.id !== id))
      if (expanded === id) setExpanded(null)
    } catch {
      // ignore
    }
    setConfirmDelete(null)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Upload Material</h1>
        <p className="mt-2 text-muted-foreground">PDF ya image upload karo, AI us se MCQs banayega.</p>
      </div>

      <label className="block max-w-xs text-sm text-muted-foreground">
        Material kis test ke liye hai?
        <select
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {testNames.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:border-border/80 hover:bg-accent/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <p className="mt-3 text-sm font-medium text-card-foreground">
          {dragOver ? "Drop file here" : "Click or drag & drop to upload"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">PDF, PNG, JPG, JPEG, WEBP · Max 10MB</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {message && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {message}
        </div>
      )}

      {file && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            {fileIcon(file.type)}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-card-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
            <button
              onClick={clearFile}
              disabled={uploading}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Processing...
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <Button variant="outline" onClick={cancelUpload} className="w-full gap-2">
                <X className="h-4 w-4" /> Cancel Upload
              </Button>
            </div>
          )}

          {!uploading && (
            <Button onClick={handleUpload} className="w-full gap-2">
              <Upload className="h-4 w-4" /> Upload & Process
            </Button>
          )}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium text-foreground">Your Documents</h2>
        </div>
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between gap-2 px-5 py-3 text-sm">
                  <button
                    onClick={() => toggleExpand(d.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                        expanded === d.id ? "rotate-180" : ""
                      }`}
                    />
                    <FileText className="h-4 w-4 shrink-0 text-blue-400" />
                    <span className="truncate font-medium text-card-foreground">{d.name}</span>
                  </button>
                  <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    {d.testName && (
                      <span className="hidden rounded-full border border-border bg-muted px-2 py-0.5 sm:inline">
                        {d.testName}
                      </span>
                    )}
                    {d.pageCount !== null && <span>{d.pageCount}p</span>}
                    <span className="hidden sm:inline">{timeAgo(d.createdAt)}</span>
                    {confirmDelete === d.id ? (
                      <span className="flex items-center gap-1">
                        <button
                          onClick={() => deleteDoc(d.id)}
                          className="rounded bg-destructive px-2 py-1 font-medium text-white"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="rounded border border-border px-2 py-1"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(d.id)}
                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        title="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {expanded === d.id && (
                  <div className="space-y-2 border-t border-border px-5 py-3">
                    {!docChunks[d.id] ? (
                      <p className="text-xs text-muted-foreground">Loading chunks...</p>
                    ) : (
                      <>
                        <p className="text-xs text-muted-foreground">
                          {docChunks[d.id].length} chunks extracted
                        </p>
                        {docChunks[d.id].slice(0, 5).map((c, i) => (
                          <div key={c.id} className="rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">Chunk {i + 1}:</span>{" "}
                            {c.content.slice(0, 200)}
                            {c.content.length > 200 ? "..." : ""}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}