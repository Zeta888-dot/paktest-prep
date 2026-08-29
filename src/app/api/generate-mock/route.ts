import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

function clean(text: string) {
  let t = text.trim()
  if (t.startsWith("```json")) t = t.slice(7)
  if (t.startsWith("```")) t = t.slice(3)
  if (t.endsWith("```")) t = t.slice(0, -3)
  return t.trim()
}

export async function POST(req: Request) {
  try {
    const { part } = await req.json()

    if (part === "a") {
      const prompt = `You are an examiner for the KPK Police Constable written test (Part A - MCQs).
Generate a mock paper with EXACTLY 20 MCQs at Class 9th & 10th level, distributed as:
- English: 4 questions
- Urdu: 4 questions (write the question and all options in proper Urdu script, Arabic Urdu, never in Roman Urdu)
- Islamiyat: 4 questions
- General Knowledge (including Pakistan Studies): 4 questions
- Mathematics: 4 questions

Rules:
- Each MCQ has exactly 4 options, ONE correct answer matching an option word-for-word
- Brief explanation for each
- Mix difficulty: easy, medium, hard
Return ONLY a valid JSON array. No markdown.
[
  { "subject": "English", "question": "...", "options": ["A","B","C","D"], "answer": "A", "explanation": "..." }
]`

      const res = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      })

      let text = clean(res.text ?? "[]")
      const start = text.indexOf("[")
      const end = text.lastIndexOf("]")
      if (start === -1 || end === -1) throw new Error("Invalid response format from AI")
      const mcqs = JSON.parse(text.slice(start, end + 1))
      if (!Array.isArray(mcqs) || mcqs.length === 0) throw new Error("No questions generated")

      const validated = mcqs.map((q: any) => {
        const exact = q.options?.find((o: string) => o === q.answer)
        if (!exact) {
          const fuzzy = q.options?.find((o: string) =>
            o.toLowerCase().includes(String(q.answer).toLowerCase())
          )
          return { ...q, answer: fuzzy || q.options?.[0] }
        }
        return q
      })

      return NextResponse.json({ mcqs: validated })
    }

    if (part === "b") {
      const prompt = `You are an examiner for the KPK Police Constable written test (Part B - Subjective).
Generate:
1. FIVE English sentences for translation into Urdu (Class 9th & 10th level)
2. FIVE Urdu sentence-formation questions (4-6 shuffled Urdu words each)
For every item provide TWO finalized reference answers:
- referenceUrdu (Urdu script)
- referenceRoman (Roman Urdu)
Return ONLY valid JSON. No markdown.
{
  "translations": [ { "question": "Pakistan is a beautiful country.", "referenceUrdu": "پاکستان ایک خوبصورت ملک ہے۔", "referenceRoman": "Pakistan ek khoobsurat mulk hai." } ],
  "formations": [ { "question": "الفاظ: پاکستان ، ہمارا ، وطن ، ہے", "referenceUrdu": "پاکستان ہمارا وطن ہے۔", "referenceRoman": "Pakistan hamara watan hai." } ]
}`

      const res = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      })

      let text = clean(res.text ?? "{}")
      const start = text.indexOf("{")
      const end = text.lastIndexOf("}")
      if (start === -1 || end === -1) throw new Error("Invalid response format from AI")
      const data = JSON.parse(text.slice(start, end + 1))
      if (!data.translations?.length || !data.formations?.length)
        throw new Error("No questions generated")

      return NextResponse.json(data)
    }

    return NextResponse.json({ error: "Invalid part" }, { status: 400 })
  } catch (e: any) {
    console.error("Generate mock error:", e)
    return NextResponse.json(
      { error: e.message || "Failed to generate mock test." },
      { status: 500 }
    )
  }
}