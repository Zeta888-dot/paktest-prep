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

    if (!context)
      return NextResponse.json({ error: "No material uploaded yet" }, { status: 400 })

    const res = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Using ONLY this study material, create ${count} MCQs about ${topic}.\nMaterial:\n${context}\n\nReturn JSON in this exact shape: {"questions":[{"question":"","options":[""],"answer":"","explanation":""}]}`,
      config: { responseMimeType: "application/json" },
    })

    const data = JSON.parse(res.text ?? "")
    return NextResponse.json({ questions: data.questions })
  } catch (e) {
    console.error("RAG generate error:", e)
    return NextResponse.json({ error: "Generation failed" }, { status: 500 })
  }
}