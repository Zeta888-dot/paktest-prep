import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const { section, count = 5 } = await req.json()

    const isTranslation = section === "english-translation"

    const prompt = isTranslation
      ? `You are an examiner for the KPK Police Constable written test (Part B - English).
Generate exactly ${count} English sentences for translation into Urdu, at Class 9th & 10th level.
Sentences must be simple, meaningful and test everyday vocabulary and grammar.
For each sentence provide TWO finalized reference answers:
1. referenceUrdu — correct translation in Urdu script (Arabic Urdu)
2. referenceRoman — correct translation in Roman Urdu (English letters)
Return ONLY a valid JSON array. No markdown.
[
  {
    "question": "Pakistan is a beautiful country.",
    "referenceUrdu": "پاکستان ایک خوبصورت ملک ہے۔",
    "referenceRoman": "Pakistan ek khoobsurat mulk hai."
  }
]`
      : `You are an examiner for the KPK Police Constable written test (Part B - Urdu).
Generate exactly ${count} sentence-formation questions at Class 9th & 10th level.
Each question gives 4-6 shuffled Urdu words; the candidate must form a correct sentence from them.
For each question provide TWO finalized reference answers:
1. referenceUrdu — correct sentence in Urdu script
2. referenceRoman — correct sentence in Roman Urdu
Return ONLY a valid JSON array. No markdown.
[
  {
    "question": "الفاظ: پاکستان ، ہمارا ، وطن ، ہے",
    "referenceUrdu": "پاکستان ہمارا وطن ہے۔",
    "referenceRoman": "Pakistan hamara watan hai."
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
    if (start === -1 || end === -1) throw new Error("Invalid response format from AI")

    const questions = JSON.parse(text.slice(start, end + 1))
    if (!Array.isArray(questions) || questions.length === 0) throw new Error("No questions generated")

    return NextResponse.json({ questions })
  } catch (e: any) {
    console.error("Generate subjective error:", e)
    return NextResponse.json(
      { error: e.message || "Failed to generate questions." },
      { status: 500 }
    )
  }
}