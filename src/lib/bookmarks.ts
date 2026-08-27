export type SavedQuestion = {
  id: string
  test: string
  question: string
  savedAt: string
  options?: string[]
  answer?: string
  explanation?: string
}

export function loadBookmarks(): SavedQuestion[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("saved-questions")
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveBookmarks(list: SavedQuestion[]) {
  localStorage.setItem("saved-questions", JSON.stringify(list))
}

export function toggleSaved(
  test: string,
  question: string,
  extra?: { options: string[]; answer: string; explanation: string }
): SavedQuestion[] {
  const list = loadBookmarks()
  const exists = list.find((b) => b.test === test && b.question === question)
  const next = exists
    ? list.filter((b) => b.id !== exists.id)
    : [
        {
          id: crypto.randomUUID(),
          test,
          question,
          savedAt: new Date().toISOString(),
          ...extra,
        },
        ...list,
      ]
  saveBookmarks(next)
  return next
}