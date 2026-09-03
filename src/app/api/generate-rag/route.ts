import { NextResponse } from "next/server"
import { sql } from "drizzle-orm"
import { GoogleGenAI } from "@google/genai"
import { db } from "@/db"
import { embedChunks } from "@/lib/rag"
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
    const { topic, count = 5, test } = await req.json()
    const seed = Math.floor(Math.random() * 100000)

    const [vec] = await embedChunks([topic])
    const vecStr = `[${vec.join(",")}]`

    const results = test
      ? await db.execute(sql`
          SELECT c.content, c.embedding <=> ${vecStr}::vector as dist
          FROM chunks c
          JOIN documents d ON c.document_id = d.id
          WHERE d.test_name = ${test}
          ORDER BY c.embedding <=> ${vecStr}::vector
          LIMIT 8
        `)
      : await db.execute(sql`
          SELECT content, embedding <=> ${vecStr}::vector as dist
          FROM chunks
          ORDER BY embedding <=> ${vecStr}::vector
          LIMIT 8
        `)

    const seen = new Set<string>()
    const context = (results as any[])
      .filter((r) => {
        if ((r.dist as number) > 0.5) return false
        const key = (r.content as string).slice(0, 100)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 5)
      .map((r) => r.content as string)
      .join("\n\n---\n\n")

    if (!context.trim()) {
      return NextResponse.json(
        {
          error: test
            ? `No relevant material for "${test}". Upload syllabus PDF or switch to Syllabus mode.`
            : "No material found. Upload a PDF first.",
        },
        { status: 400 }
      )
    }

    const prompt = `You are an expert examiner for Pakistani competitive exams.
Using ONLY the study material below, create ${count} MCQs about: "${topic}"

CONTEXT:
${context}

CRITICAL RULES:
- Use ONLY the provided material. Do NOT invent facts.
- Each question: exactly 4 options, ONE correct answer.
- For English vocabulary, use <u>HTML underline tags</u> for underlined words. NEVER use quotes/apostrophes.
- Urdu must be in proper Urdu script (اردو), NEVER Roman Urdu.
- Generate NEW questions different from previous attempts.
- The "answer" field must match one option word-for-word.
- Return ONLY valid JSON: {"questions": [...]}

JSON format:
{
  "questions": [
    {
      "question": "What is...?",
      "options": ["A", "B", "C", "D"],
      "answer": "B",
      "explanation": "According to the material..."
    }
  ]
}`

    const res = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 1.0,
        topK: 40,
        topP: 0.95,
        seed,
      },
    })

    const text = clean(res.text ?? '{"questions":[]}')
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start === -1 || end === -1) throw new Error("Invalid format")

    const data = JSON.parse(text.slice(start, end + 1))
    if (!data.questions?.length) throw new Error("No questions generated")

    return NextResponse.json({ questions: data.questions })
  } catch (e: any) {
    console.error("RAG error:", e)
    return NextResponse.json({ error: friendlyError(e) }, { status: 500 })
  }
}