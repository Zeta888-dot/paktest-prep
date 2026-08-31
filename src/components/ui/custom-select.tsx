"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type SelectOption<T = string> = {
  value: T
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface CustomSelectProps<T> {
  value: T
  onChange: (value: T) => void
  options: SelectOption<T>[]
  placeholder?: string
  className?: string
}

export function CustomSelect<T extends string | number>({
  value,
  onChange,
  options,
  placeholder = "Select...",
  className,
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, handleClickOutside])

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm transition",
          "hover:border-foreground/20 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/10",
          open && "border-primary/40 ring-1 ring-primary/10"
        )}
      >
        {selected?.icon && (
          <selected.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="flex-1 truncate text-left text-foreground">
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => {
              const isSelected = opt.value === value
              const Icon = opt.icon
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition",
                    isSelected
                      ? "bg-accent font-medium text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  {Icon ? (
                    <Icon className={cn("h-4 w-4 shrink-0", isSelected ? "text-foreground" : "text-muted-foreground")} />
                  ) : (
                    <span className="h-4 w-4 shrink-0" />
                  )}
                  <span className="flex-1 truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}