"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMessage("Uploading and processing...")
    const form = new FormData()
    form.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setMessage("Done: " + data.message)
    } catch (err: any) {
      setMessage("Error: " + err.message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Upload Material</h1>
      <p className="mt-2 text-muted-foreground">PDF ya image upload karo, AI us se MCQs banayega.</p>

      <div className="mt-6 max-w-md rounded-lg border border-border bg-card p-6">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:opacity-90 disabled:opacity-50"
        />
        {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}