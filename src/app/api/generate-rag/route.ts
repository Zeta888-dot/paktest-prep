import { NextResponse } from "next/server"
import { sql } from "drizzle-orm"
import { GoogleGenAI } from "@google/genai"
import { db } from "@/db"
import { embedChunks } from "@/lib/rag"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const { topic, count = 5, test } = await req.json()
    const seed = Math.floor(Math.random() * 100000)

    const [vec] = await embedChunks([topic])
    const vecStr = `[${vec.join(",")}]`

    // Fetch MORE chunks with diversity (8 instead of 3)
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
    
    // Deduplicate and filter low relevance
    const seen = new Set<string>()
    const context = results
      .filter((r: any) => {
        if ((r.dist as number) > 0.5) return false // filter low similarity
        const key = (r.content as string).slice(0, 100)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 5) // top 5 diverse chunks
      .map((r: any) => r.content as string)
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
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        temperature: 1.0,
        seed: seed,
      },
    })

    let text = res.text ?? '{"questions":[]}'
    text = text.trim()
    if (text.startsWith("```json")) text = text.slice(7)
    if (text.startsWith("```")) text = text.slice(3)
    if (text.endsWith("```")) text = text.slice(0, -3)
    text = text.trim()

    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start === -1 || end === -1) throw new Error("Invalid format")

    const data = JSON.parse(text.slice(start, end + 1))
    if (!data.questions?.length) throw new Error("No questions generated")

    return NextResponse.json({ questions: data.questions })
  } catch (e: any) {
    console.error("RAG error:", e)
    return NextResponse.json(
      { error: e.message || "Failed to generate from material." },
      { status: 500 }
    )
  }
}