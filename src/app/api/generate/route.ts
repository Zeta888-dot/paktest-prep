import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const { test, topic, count = 5, difficulty = "medium" } = await req.json()

    const focusArea = topic || test

    const prompt = `You are a senior examiner for Pakistani competitive exams (NTS, ETEA, PPSC, FPSC, KPK Police, CSS, etc.).

Generate exactly ${count} high-quality MCQs for this test and topic:

Test: "${test}"
Subject/Topic: "${focusArea}"

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
- EASY: direct recall and definition-based questions
- MEDIUM: conceptual questions with simple application
- HARD: tricky, application-based, multi-step reasoning questions

REQUIREMENTS:
1. Questions must be strictly related to the subject/topic mentioned above
2. Difficulty: Class 9th & 10th (Secondary School) level — as per official KPK Police syllabus
3. Each question must have EXACTLY 4 options labeled A, B, C, D
4. Only ONE correct answer — it must match one of the 4 options EXACTLY (word-for-word)
5. Avoid repetitive questions — each must test a different concept
6. Include variety: factual, conceptual, application-based
7. For English: focus on grammar, vocabulary, tenses, voice, prepositions
8. For Urdu: focus on grammar, synonyms/antonyms, idioms, proverbs
9. For Pak Studies: focus on history, geography, constitution, personalities
10. For Islamiyat: focus on Quran, Hadith, Seerat, Khulafa, Islamic events
11. For GK/Current Affairs: focus on Pakistan-centric facts, recent events
12. For Mathematics: focus on arithmetic, algebra, geometry, sets — with numerical problems where relevant
13. Explanation must be concise (1-2 sentences) and educational
14. The "answer" field MUST exactly match one of the 4 options — do NOT abbreviate

Return ONLY a valid JSON array. No markdown, no extra text.

JSON format:
[
  {
    "question": "What is the capital of Pakistan?",
    "options": ["Karachi", "Lahore", "Islamabad", "Quetta"],
    "answer": "Islamabad",
    "explanation": "Islamabad became the capital of Pakistan in 1967, replacing Karachi."
  }
]`

    const res = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    })

    let text = res.text ?? "[]"
    text = text.trim()
    if (text.startsWith("```json")) text = text.slice(7)
    if (text.startsWith("```")) text = text.slice(3)
    if (text.endsWith("```")) text = text.slice(0, -3)
    text = text.trim()

    const start = text.indexOf("[")
    const end = text.lastIndexOf("]")
    if (start === -1 || end === -1) {
      throw new Error("Invalid response format from AI")
    }

    const questions = JSON.parse(text.slice(start, end + 1))

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("No questions generated")
    }

    // Validate: ensure answer matches one of the options exactly
    const validated = questions.map((q: any) => {
      const exactMatch = q.options.find((opt: string) => opt === q.answer)
      if (!exactMatch) {
        const fuzzyMatch = q.options.find((opt: string) =>
          opt.toLowerCase().includes(String(q.answer).toLowerCase())
        )
        return { ...q, answer: fuzzyMatch || q.options[0] }
      }
      return q
    })

    return NextResponse.json({ questions: validated })
  } catch (e: any) {
    console.error("Generate error:", e)
    return NextResponse.json(
      { error: e.message || "Failed to generate questions. Please try again." },
      { status: 500 }
    )
  }
}