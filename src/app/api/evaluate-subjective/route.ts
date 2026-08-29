import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const { section, question, reference, answer } = await req.json()

    const sectionDesc =
      section === "english-translation"
        ? "English to Urdu translation"
        : "Urdu sentence formation"

    const prompt = `You are a strict but fair examiner for the KPK Police Constable written test.
Task type: ${sectionDesc}
Question: ${question}
Reference answer: ${reference}
Candidate's answer: ${answer}

Evaluate the candidate's answer. Accept answers written in Urdu script OR Roman Urdu (English letters).
Award a score from 0 to 2:
- 2 = fully correct meaning and structure (minor spelling mistakes acceptable)
- 1 = partially correct, main idea conveyed but wrong word order or missing words
- 0 = incorrect, irrelevant, or empty

Return ONLY valid JSON. No markdown.
{ "score": 1, "feedback": "Short explanation in simple English of what was good/wrong, and state the correct answer." }`

    const res = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    })

    let text = res.text ?? "{}"
    text = text.trim()
    if (text.startsWith("```json")) text = text.slice(7)
    if (text.startsWith("```")) text = text.slice(3)
    if (text.endsWith("```")) text = text.slice(0, -3)
    text = text.trim()

    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start === -1 || end === -1) throw new Error("Invalid evaluation format")

    const result = JSON.parse(text.slice(start, end + 1))
    const score = Math.min(2, Math.max(0, Number(result.score) || 0))

    return NextResponse.json({ score, feedback: result.feedback || "" })
  } catch (e: any) {
    console.error("Evaluate subjective error:", e)
    return NextResponse.json(
      { error: e.message || "Failed to evaluate answer." },
      { status: 500 }
    )
  }
}