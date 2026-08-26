export type Settings = {
  displayName: string
  questionsPerTest: number
  defaultSource: "syllabus" | "material"
}

export const defaultSettings: Settings = {
  displayName: "",
  questionsPerTest: 5,
  defaultSource: "syllabus",
}

export function loadSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings
  try {
    const raw = localStorage.getItem("settings")
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

export function saveSettings(s: Settings) {
  localStorage.setItem("settings", JSON.stringify(s))
}