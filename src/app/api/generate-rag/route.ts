import { NextResponse } from "next/server"
import { sql } from "drizzle-orm"
import { GoogleGenAI } from "@google/genai"
import { db } from "@/db"
import { embedChunks } from "@/lib/rag"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const { topic, count = 5 } = await req.json()

    const [vec] = await embedChunks([topic])
    const vecStr = `[${vec.join(",")}]`

    const results = await db.execute(sql`
      SELECT content FROM chunks
      ORDER BY embedding <=> ${vecStr}::vector
      LIMIT 3
    `)
    const context = results.map((r) => r.content as string).join("\n\n")

    if (!context.trim()) {
      return NextResponse.json(
        { error: "No material uploaded yet. Please upload a PDF or image first." },
        { status: 400 }
      )
    }

    const prompt = `You are an expert for Pakistani competitive exams. Using ONLY the study material provided below, create ${count} multiple-choice questions (MCQs) about: "${topic}".

STRICT RULES:
- Use ONLY the information from the provided material. Do NOT make up facts.
- Each question must have exactly 4 options (A, B, C, D).
- Only ONE correct answer per question.
- Provide a brief explanation referencing the material.
- Return ONLY a valid JSON object with a "questions" array. No markdown, no extra text.

STUDY MATERIAL:
${context}

JSON format:
{
  "questions": [
    {
      "question": "What is...?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option B",
      "explanation": "According to the material..."
    }
  ]
}`

    const res = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    })

    let text = res.text ?? '{"questions":[]}'
    
    text = text.trim()
    if (text.startsWith("```json")) text = text.slice(7)
    if (text.startsWith("```")) text = text.slice(3)
    if (text.endsWith("```")) text = text.slice(0, -3)
    text = text.trim()

    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start === -1 || end === -1) {
      throw new Error("Invalid response format from AI")
    }

    const data = JSON.parse(text.slice(start, end + 1))

    if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
      throw new Error("No questions generated from material")
    }

    return NextResponse.json({ questions: data.questions })
  } catch (e: any) {
    console.error("RAG generate error:", e)
    return NextResponse.json(
      { error: e.message || "Failed to generate questions from material. Please try again." },
      { status: 500 }
    )
  }
}