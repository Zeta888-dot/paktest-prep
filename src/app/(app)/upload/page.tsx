"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
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
  File,
  MoreHorizontal,
  BookOpen,
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

const testOptions = [
  { value: "Police Constable (KPK / Islamabad)", label: "Police Constable (KPK / Islamabad)", icon: BookOpen },
  { value: "Junior / Senior Clerk", label: "Junior / Senior Clerk", icon: BookOpen },
  { value: "Stenotypist", label: "Stenotypist", icon: BookOpen },
  { value: "ASF", label: "ASF", icon: BookOpen },
  { value: "Air Force Commission Posts", label: "Air Force Commission Posts", icon: BookOpen },
  { value: "MDCAT", label: "MDCAT", icon: BookOpen },
  { value: "ECAT", label: "ECAT", icon: BookOpen },
  { value: "SST (Senior Subject Specialist)", label: "SST (Senior Subject Specialist)", icon: BookOpen },
  { value: "CT (Certified Teacher)", label: "CT (Certified Teacher)", icon: BookOpen },
  { value: "PST (Primary School Teacher)", label: "PST (Primary School Teacher)", icon: BookOpen },
  { value: "PASI (Assistant Sub Inspector)", label: "PASI (Assistant Sub Inspector)", icon: BookOpen },
  { value: "CSS & PMS", label: "CSS & PMS", icon: BookOpen },
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
  if (type.startsWith("image/")) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
        <ImageIcon className="h-4 w-4" />
      </div>
    )
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
      <FileText className="h-4 w-4" />
    </div>
  )
}

function documentIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase()
  if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp") {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
        <ImageIcon className="h-4 w-4" />
      </div>
    )
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
      <File className="h-4 w-4" />
    </div>
  )
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
      setError("Only PDF, PNG, JPG, JPEG, or WEBP files are allowed.")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.")
      return
    }
    setFile(f)
    setError("")
    setMessage("")
    setProgress(0)
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
      if (err?.name === "AbortError") setError("Upload cancelled.")
      else setError(err.message || "Upload failed. Please try again.")
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
    } catch {}
    setConfirmDelete(null)
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Upload Material</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add study material and let AI turn it into practice questions.
        </p>
      </div>

      {/* Target selector */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Preparation target</p>
          <p className="text-xs text-muted-foreground">
            Choose the test this material belongs to.
          </p>
        </div>
        <div className="w-full sm:w-80">
          <CustomSelect
            value={testName}
            onChange={setTestName}
            options={testOptions}
          />
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && !uploading && inputRef.current?.click()}
        className={`
          group relative overflow-hidden rounded-xl border
          px-5 py-8 text-center
          transition
          sm:px-8 sm:py-10
          ${
            dragOver
              ? "cursor-copy border-primary bg-primary/5"
              : file
              ? "border-border bg-card"
              : "cursor-pointer border-dashed border-border bg-card/50 hover:border-foreground/20 hover:bg-card"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />

        {!file ? (
          <>
            <div
              className={`
                mx-auto flex h-11 w-11 items-center justify-center
                rounded-lg border border-border bg-background
                transition
                ${dragOver ? "border-primary bg-primary/5" : "group-hover:border-primary/30"}
              `}
            >
              <Upload
                className={`
                  h-5 w-5 transition
                  ${dragOver ? "text-primary" : "text-muted-foreground group-hover:text-primary"}
                `}
              />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              {dragOver ? "Drop your material here" : "Upload study material"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Drag & drop or click to browse</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {["PDF", "PNG", "JPG", "WEBP"].map((type) => (
                <span key={type} className="rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {type}
                </span>
              ))}
              <span className="px-1 py-0.5 text-[10px] text-muted-foreground">Max 10MB</span>
            </div>
          </>
        ) : (
          <div className="mx-auto flex max-w-2xl items-center gap-3 text-left" onClick={(e) => e.stopPropagation()}>
            {fileIcon(file.type)}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatBytes(file.size)} · {testName}
              </p>
              {uploading && (
                <div className="mt-2">
                  <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Processing...
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {!uploading ? (
              <button
                onClick={clearFile}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={cancelUpload}
                className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {file && !uploading && (
        <div className="flex justify-end">
          <Button onClick={handleUpload} className="h-9 gap-2 rounded-lg px-4 text-sm">
            <Upload className="h-4 w-4" />
            Upload & Process
          </Button>
        </div>
      )}

      {(error || message) && (
        <div
          className={`
            flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs
            ${
              error
                ? "border-red-500/30 bg-red-500/5 text-red-500"
                : "border-primary/30 bg-primary/5 text-primary"
            }
          `}
        >
          {error ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
          <span>{error || message}</span>
        </div>
      )}

      {/* Documents list */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Your Documents</h2>
            <span className="text-xs text-muted-foreground">({docs.length})</span>
          </div>
          {docs.length > 0 && (
            <span className="hidden text-xs text-muted-foreground sm:block">
              Click to inspect content
            </span>
          )}
        </div>

        {docs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
            <FolderOpen className="mx-auto h-5 w-5 text-muted-foreground/60" />
            <p className="mt-2 text-sm text-muted-foreground">No documents uploaded yet.</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Your processed study material will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {docs.map((d, index) => {
              const isExpanded = expanded === d.id
              return (
                <div
                  key={d.id}
                  className={`transition-colors ${index !== docs.length - 1 ? "border-b border-border" : ""} ${isExpanded ? "bg-accent/30" : "hover:bg-accent/20"}`}
                >
                  <div className="flex min-w-0 items-center gap-2 px-3 py-2.5 sm:px-4">
                    <button onClick={() => toggleExpand(d.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <ChevronDown
                        className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                      {documentIcon(d.name)}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{d.name}</p>
                        <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                          {d.testName && (
                            <>
                              <span className="max-w-[180px] truncate sm:max-w-none">{d.testName}</span>
                              <span>·</span>
                            </>
                          )}
                          {d.pageCount !== null && (
                            <>
                              <span>{d.pageCount} pages</span>
                              <span>·</span>
                            </>
                          )}
                          <span className="shrink-0">{timeAgo(d.createdAt)}</span>
                        </div>
                      </div>
                    </button>

                    <div className="flex shrink-0 items-center">
                      {confirmDelete === d.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteDoc(d.id)}
                            className="rounded-md bg-red-600 px-2 py-1 text-[10px] font-medium text-white transition hover:bg-red-500"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground transition hover:bg-accent"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            className="hidden rounded-md p-1.5 text-muted-foreground transition hover:bg-accent sm:block"
                            title="More options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(d.id)}
                            className="rounded-md p-1.5 text-muted-foreground opacity-60 transition hover:bg-red-500/10 hover:text-red-500 hover:opacity-100"
                            title="Delete document"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className={`grid transition-all ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="min-h-0 overflow-hidden">
                      <div className="border-t border-border px-4 py-3 pl-11">
                        {!docChunks[d.id] ? (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading extracted content...
                          </div>
                        ) : (
                          <>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                Extracted chunks
                              </span>
                              <span className="text-[10px] text-muted-foreground">{docChunks[d.id].length} chunks</span>
                            </div>
                            <div className="space-y-1.5">
                              {docChunks[d.id].slice(0, 5).map((c, i) => (
                                <div key={c.id} className="rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                                  <div className="mb-0.5 flex items-center gap-2">
                                    <span className="font-medium text-foreground">Chunk {i + 1}</span>
                                    {c.pageNumber !== null && (
                                      <span className="text-[10px] text-muted-foreground">Page {c.pageNumber}</span>
                                    )}
                                  </div>
                                  <p>
                                    {c.content.slice(0, 250)}
                                    {c.content.length > 250 ? "..." : ""}
                                  </p>
                                </div>
                              ))}
                            </div>
                            {docChunks[d.id].length > 5 && (
                              <p className="mt-2 text-[10px] text-muted-foreground">Showing first 5 chunks.</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}