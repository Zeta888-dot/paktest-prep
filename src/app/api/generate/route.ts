import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const { test, count = 5 } = await req.json()

    const prompt = `You are an expert for Pakistani competitive exams. Generate ${count} MCQs for: ${test}. Return only a JSON array where each item has: question, options (4 strings), answer, explanation.`

    const res = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    })

    const text = res.text ?? "[]"
    const start = text.indexOf("[")
    const end = text.lastIndexOf("]")
    const questions = JSON.parse(text.slice(start, end + 1))

    return NextResponse.json({ questions })
  } catch (e) {
    console.error("Generate error:", e)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}