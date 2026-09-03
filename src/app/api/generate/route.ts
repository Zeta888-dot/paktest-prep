import { NextResponse } from "next/server"
import { friendlyError } from "@/lib/ai-errors"
import { generateJSON } from "@/lib/ai"

function clean(text: string) {
  let t = text.trim()
  if (t.startsWith("```json")) t = t.slice(7)
  if (t.startsWith("```")) t = t.slice(3)
  if (t.endsWith("```")) t = t.slice(0, -3)
  return t.trim()
}

export async function POST(req: Request) {
  try {
    const { test, topic, count = 5, difficulty = "medium" } = await req.json()

    const focusArea = topic || test

    const varietyPool = [
      "Tenses", "Prepositions", "Active Passive Voice", "Synonyms Antonyms",
      "Idioms Phrases", "Islamic History", "Khulafa-e-Rashideen", "Pakistan Movement",
      "Constitution 1973", "LCM HCF", "Percentage", "Profit Loss",
    ]
    const varietyHints = varietyPool
      .sort(() => 0.5 - Math.random())
      .slice(0, 4)
      .join(", ")

    const prompt = `You are a senior examiner for Pakistani competitive exams.
Generate exactly ${count} high-quality MCQs for:
Test: "${test}"
Subject/Topic: "${focusArea}"

DIFFICULTY: ${difficulty.toUpperCase()}
- EASY: direct recall
- MEDIUM: conceptual
- HARD: tricky, application-based, multi-step reasoning

STRICT RULES:
1. Generate COMPLETELY NEW questions every time. Never repeat common examples.
2. For English questions about an underlined word, wrap that word in HTML <u> tags. Example: "What is the meaning of <u>word</u>?" NEVER use 'word' or "word".
3. Urdu text must be in proper Urdu script (اردو), NEVER Roman Urdu.
4. Each question: exactly 4 options, ONE correct answer.
5. The "answer" field must match one option word-for-word.
6. Explanations: 1-2 sentences, educational.
7. Return ONLY a valid JSON array. No markdown.

Variety hints (use only when relevant to the subject): ${varietyHints}

JSON:
[
  {
    "question": "What is the capital of Pakistan?",
    "options": ["Karachi", "Lahore", "Islamabad", "Quetta"],
    "answer": "Islamabad",
    "explanation": "Islamabad became the capital in 1967."
  }
]`

    const text = clean(await generateJSON(prompt, 1.0))
    const start = text.indexOf("[")
    const end = text.lastIndexOf("]")
    if (start === -1 || end === -1) throw new Error("Invalid response format")

    const questions = JSON.parse(text.slice(start, end + 1))
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("No questions generated")
    }

    const validated = questions.map((q: any) => {
      const exactMatch = q.options?.find((opt: string) => opt === q.answer)
      if (!exactMatch) {
        const fuzzyMatch = q.options?.find((opt: string) =>
          opt.toLowerCase().includes(String(q.answer).toLowerCase())
        )
        return { ...q, answer: fuzzyMatch || q.options?.[0] }
      }
      return q
    })

    return NextResponse.json({ questions: validated })
  } catch (e: any) {
    console.error("Generate error:", e)
    return NextResponse.json({ error: friendlyError(e) }, { status: 500 })
  }
}