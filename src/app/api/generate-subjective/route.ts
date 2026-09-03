import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"
import { friendlyError } from "@/lib/ai-errors"

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
    const { test } = await req.json()

    const prompt = `You are an examiner for ${test || "Pakistani competitive exams"} written test (Part B - Subjective).
Generate:
1. FIVE English sentences for translation into Urdu (Class 9th & 10th level)
2. FIVE Urdu sentence-formation questions (4-6 shuffled Urdu words each)

For every item provide TWO finalized reference answers:
- referenceUrdu (Urdu script)
- referenceRoman (Roman Urdu)

RULES:
- referenceUrdu must be in proper Urdu script (اردو), NEVER Roman Urdu.
- Sentences should be exam-standard and varied each time.
- Return ONLY valid JSON. No markdown.

{
  "translations": [ { "question": "Pakistan is a beautiful country.", "referenceUrdu": "پاکستان ایک خوبصورت ملک ہے۔", "referenceRoman": "Pakistan ek khoobsurat mulk hai." } ],
  "formations": [ { "question": "الفاظ: پاکستان ، ہمارا ، وطن ، ہے", "referenceUrdu": "پاکستان ہمارا وطن ہے۔", "referenceRoman": "Pakistan hamara watan hai." } ]
}`

    const res = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.9,
      },
    })

    const text = clean(res.text ?? "{}")
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start === -1 || end === -1) throw new Error("Invalid response format")

    const data = JSON.parse(text.slice(start, end + 1))
    if (!data.translations?.length || !data.formations?.length)
      throw new Error("No questions generated")

    return NextResponse.json(data)
  } catch (e: any) {
    console.error("Generate subjective error:", e)
    return NextResponse.json({ error: friendlyError(e) }, { status: 500 })
  }
}