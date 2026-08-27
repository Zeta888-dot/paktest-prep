"use client"

import { useEffect } from "react"

export function ThemeInit() {
  useEffect(() => {
    try {
      const t = localStorage.getItem("theme") || "dark"
      const dark =
        t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      document.documentElement.classList.toggle("dark", dark)
    } catch {}
  }, [])
  return null
}