import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const { test, count = 5 } = await req.json()

    const prompt = `You are an expert for Pakistani competitive exams. Generate ${count} multiple-choice questions (MCQs) for: "${test}".

Requirements:
- Questions must be relevant to Pakistani exam standards (NTS, ETEA, PPSC, FPSC, MDCAT, ECAT, etc.)
- Each question must have exactly 4 options (A, B, C, D)
- Only ONE correct answer per question
- Provide a brief explanation for the correct answer
- Return ONLY a valid JSON array. No markdown, no extra text.

JSON format:
[
  {
    "question": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option B",
    "explanation": "Because..."
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

    return NextResponse.json({ questions })
  } catch (e: any) {
    console.error("Generate error:", e)
    return NextResponse.json(
      { error: e.message || "Failed to generate questions. Please try again." },
      { status: 500 }
    )
  }
}