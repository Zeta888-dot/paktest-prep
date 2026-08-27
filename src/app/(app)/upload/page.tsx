"use client"

import { useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, ImageIcon, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

function fileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-purple-400" />
  return <FileText className="h-8 w-8 text-blue-400" />
}

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

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

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form })
      clearInterval(interval)
      setProgress(100)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setMessage(data.message || "Upload successful!")
      setFile(null)
      if (inputRef.current) inputRef.current.value = ""
    } catch (err: any) {
      clearInterval(interval)
      setProgress(0)
      setError(err.message || "Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  function clearFile() {
    setFile(null)
    setError("")
    setMessage("")
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Upload Material</h1>
        <p className="mt-2 text-muted-foreground">PDF ya image upload karo, AI us se MCQs banayega.</p>
      </div>

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
            <div className="space-y-1">
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
            </div>
          )}

          <Button onClick={handleUpload} disabled={uploading} className="w-full gap-2">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" /> Upload & Process
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}