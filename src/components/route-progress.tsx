"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function RouteProgress() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    setVisible(true)
    setProgress(0)

    const timers: NodeJS.Timeout[] = []

    timers.push(setTimeout(() => setProgress(30), 50))
    timers.push(setTimeout(() => setProgress(60), 150))
    timers.push(setTimeout(() => setProgress(85), 300))
    timers.push(setTimeout(() => setProgress(100), 500))
    timers.push(setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 700))

    return () => timers.forEach(clearTimeout)
  }, [pathname, searchParams])

  if (!visible) return null

  return (
    <div className="fixed left-0 right-0 top-0 z-[100] h-[2px] bg-transparent">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? "width 0.2s ease-out, opacity 0.3s ease-out 0.2s" : "width 0.3s ease-out",
        }}
      />
    </div>
  )
}