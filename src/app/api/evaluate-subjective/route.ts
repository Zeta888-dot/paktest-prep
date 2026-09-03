import { NextResponse } from "next/server"

function normalize(s: string) {
  return s.toLowerCase().replace(/[.,!?;:"'۔،؟؛]/g, "").replace(/\s+/g, " ").trim()
}

function similarity(a: string, b: string) {
  const wordsA = new Set(normalize(a).split(" ").filter(Boolean))
  const wordsB = normalize(b).split(" ").filter(Boolean)
  if (wordsA.size === 0 || wordsB.length === 0) return 0
  let hit = 0
  for (const w of wordsB) if (wordsA.has(w)) hit++
  return hit / wordsB.length
}

export async function POST(req: Request) {
  try {
    const { userAnswer, referenceUrdu, referenceRoman } = await req.json()

    if (!userAnswer?.trim()) {
      return NextResponse.json({ score: 0, feedback: "No answer provided." }, { status: 400 })
    }

    const s = Math.max(
      similarity(userAnswer, referenceRoman ?? ""),
      similarity(userAnswer, referenceUrdu ?? "")
    )

    const score = s >= 0.7 ? 2 : s >= 0.4 ? 1 : 0
    const feedback =
      score === 2
        ? "Excellent! Your answer matches the reference."
        : score === 1
        ? "Partially correct. Review the reference answer."
        : "Not quite. Study the reference answer carefully."

    return NextResponse.json({ score, feedback })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong on our side. Please try again." },
      { status: 500 }
    )
  }
}