import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const { test, topic, count = 5, difficulty = "medium" } = await req.json()

    const focusArea = topic || test
    const seed = Math.floor(Math.random() * 100000)
    const dynamicTopics = [
      "Tenses", "Prepositions", "Active Passive Voice", "Synonyms Antonyms",
      "Idioms Phrases", "Islamic History", "Khulafa-e-Rashideen", "Pakistan Movement",
      "Constitution 1973", "LCM HCF", "Percentage", "Profit Loss"
    ]
    const injectedTopics = dynamicTopics
      .sort(() => 0.5 - Math.random())
      .slice(0, 4)
      .join(", ")

    const prompt = `You are a senior examiner for Pakistani competitive exams.

Generate exactly ${count} high-quality MCQs for:
Test: "${test}"
Subject/Topic: "${focusArea}"

DIFFICULTY: ${difficulty.toUpperCase()}
- EASY: direct recall
- MEDIUM: conceptual
- HARD: tricky, application-based, multi-step reasoning

STRICT RULES:
1. Temperature is high — generate COMPLETELY NEW questions, never repeat common examples.
2. For English questions about underlined words, use HTML <u> tags. Example: "What is the meaning of <u>word</u>?" NEVER use 'word' or "word".
3. Urdu text must be in proper Urdu script (اردو), NEVER Roman Urdu.
4. Each question: exactly 4 options, ONE correct answer matching EXACTLY.
5. Answer must match one option word-for-word.
6. Explanations: 1-2 sentences, educational.
7. Return ONLY valid JSON array.

Injected variety topics to avoid repetition: ${injectedTopics}

JSON:
[
  {
    "question": "What is the capital of Pakistan?",
    "options": ["Karachi", "Lahore", "Islamabad", "Quetta"],
    "answer": "Islamabad",
    "explanation": "Islamabad became the capital in 1967."
  }
]`

    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        temperature: 1.0,
        topK: 40,
        topP: 0.95,
        seed: seed,
      },
    })

    let text = res.text ?? "[]"
    text = text.trim()
    if (text.startsWith("```json")) text = text.slice(7)
    if (text.startsWith("```")) text = text.slice(3)
    if (text.endsWith("```")) text = text.slice(0, -3)
    text = text.trim()

    const start = text.indexOf("[")
    const end = text.lastIndexOf("]")
    if (start === -1 || end === -1) throw new Error("Invalid response format")

    const questions = JSON.parse(text.slice(start, end + 1))
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("No questions generated")
    }

    const validated = questions.map((q: any) => {
      const exactMatch = q.options.find((opt: string) => opt === q.answer)
      if (!exactMatch) {
        const fuzzyMatch = q.options.find((opt: string) =>
          opt.toLowerCase().includes(String(q.answer).toLowerCase())
        )
        return { ...q, answer: fuzzyMatch || q.options[0] }
      }
      return q
    })

    return NextResponse.json({ questions: validated })
  } catch (e: any) {
    console.error("Generate error:", e)
    return NextResponse.json(
      { error: e.message || "Failed to generate questions." },
      { status: 500 }
    )
  }
}