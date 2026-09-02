import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { questions } from "@/db/schema"
import { sql } from "drizzle-orm"
import { getSyllabus } from "@/lib/syllabus"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

function clean(text: string) {
  let t = text.trim()
  if (t.startsWith("```json")) t = t.slice(7)
  if (t.startsWith("```")) t = t.slice(3)
  if (t.endsWith("```")) t = t.slice(0, -3)
  return t.trim()
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandomTopics(subject: string, count: number): string[] {
  const syllabus = getSyllabus("Police Constable (KPK)")
  const subj = syllabus?.subjects.find((s) => s.name === subject)
  if (!subj) return []
  return shuffle(subj.topics).slice(0, Math.min(count, subj.topics.length))
}

async function fetchRecentQuestions(subject: string, limit = 50): Promise<string[]> {
  const res = await db.execute(sql`
    SELECT question FROM questions 
    WHERE source = ${`mock-kpk-${subject}`}
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `)
  return res.map((r: any) => r.question as string)
}

async function generateSubjectMCQs(
  subject: string,
  count: number,
  difficulty: string,
  recentQs: string[]
) {
  const topics = pickRandomTopics(subject, 6).join(", ")
  const seed = Math.floor(Math.random() * 100000)
  
  const prompt = `You are a senior examiner for KPK Police Constable (BPS-7) written test 2022.
Generate EXACTLY ${count} distinct MCQs for: ${subject}
Focus areas: ${topics}
Difficulty: ${difficulty} (Matric/Class 9-10 level)

CRITICAL RULES:
1. Each question must be UNIQUE and different from these recently used questions:
${recentQs.slice(0, 10).join("\n") || "None"}

2. For English vocabulary/grammar questions, if asking about an underlined word, WRAP that word in HTML <u> tags. Example: "What is the synonym of the <u>bold</u> word?" NEVER use quotes or apostrophes like 'word'.

3. For Urdu questions, write ALL text in proper Urdu script (اردو), NEVER Roman Urdu.

4. Each MCQ must have exactly 4 options (A,B,C,D). The "answer" field MUST match one option EXACTLY word-for-word.

5. Questions should be challenging and exam-standard, not trivial.

6. Return ONLY a valid JSON array. No markdown, no extra text.

JSON format:
[
  { "subject": "${subject}", "question": "...", "options": ["A","B","C","D"], "answer": "A", "explanation": "..." }
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

  let text = clean(res.text ?? "[]")
  const start = text.indexOf("[")
  const end = text.lastIndexOf("]")
  if (start === -1 || end === -1) throw new Error(`Invalid JSON from AI for ${subject}`)
  const mcqs = JSON.parse(text.slice(start, end + 1))
  
  if (!Array.isArray(mcqs) || mcqs.length === 0) {
    throw new Error(`No questions generated for ${subject}`)
  }

  // Validate and fix answers
  const validated = mcqs.map((q: any) => {
    const exact = q.options?.find((o: string) => o === q.answer)
    if (!exact) {
      const fuzzy = q.options?.find((o: string) =>
        o.toLowerCase().includes(String(q.answer).toLowerCase())
      )
      return { ...q, answer: fuzzy || q.options?.[0] }
    }
    return q
  })

  // Store in DB for deduplication
  for (const q of validated) {
    try {
      await db.insert(questions).values({
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        source: `mock-kpk-${subject}`,
      })
    } catch { /* ignore duplicates */ }
  }

  return validated
}

export async function POST(req: Request) {
  try {
    const { part, difficulty = "hard" } = await req.json()

    if (part === "a") {
      // Parallel generation for all 5 subjects per KPK syllabus
      const [recentEng, recentUrdu, recentIsl, recentGK, recentMath] = await Promise.all([
        fetchRecentQuestions("English", 30),
        fetchRecentQuestions("Urdu", 30),
        fetchRecentQuestions("Islamiyat", 30),
        fetchRecentQuestions("General Knowledge (incl. Pak Studies)", 30),
        fetchRecentQuestions("Mathematics", 30),
      ])

      const [eng, urdu, isl, gk, math] = await Promise.all([
        generateSubjectMCQs("English", 15, difficulty, recentEng),
        generateSubjectMCQs("Urdu", 15, difficulty, recentUrdu),
        generateSubjectMCQs("Islamiyat", 15, difficulty, recentIsl),
        generateSubjectMCQs("General Knowledge (incl. Pak Studies)", 20, difficulty, recentGK),
        generateSubjectMCQs("Mathematics", 15, difficulty, recentMath),
      ])

      const allMCQs = shuffle([...eng, ...urdu, ...isl, ...gk, ...math])
      
      return NextResponse.json({ mcqs: allMCQs })
    }

    if (part === "b") {
      const prompt = `You are an examiner for KPK Police Constable written test (Part B - Subjective).
Generate:
1. FIVE English sentences for translation into Urdu (Class 9th & 10th level)
2. FIVE Urdu sentence-formation questions (4-6 shuffled Urdu words each)
For every item provide TWO finalized reference answers:
- referenceUrdu (Urdu script)
- referenceRoman (Roman Urdu)
Return ONLY valid JSON. No markdown.
{
  "translations": [ { "question": "Pakistan is a beautiful country.", "referenceUrdu": "پاکستان ایک خوبصورت ملک ہے۔", "referenceRoman": "Pakistan ek khoobsurat mulk hai." } ],
  "formations": [ { "question": "الفاظ: پاکستان ، ہمارا ، وطن ، ہے", "referenceUrdu": "پاکستان ہمارا وطن ہے۔", "referenceRoman": "Pakistan hamara watan hai." } ]
}`

      const res = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.8 },
      })

      let text = clean(res.text ?? "{}")
      const start = text.indexOf("{")
      const end = text.lastIndexOf("}")
      if (start === -1 || end === -1) throw new Error("Invalid response format from AI")
      const data = JSON.parse(text.slice(start, end + 1))
      if (!data.translations?.length || !data.formations?.length)
        throw new Error("No questions generated")

      return NextResponse.json(data)
    }

    return NextResponse.json({ error: "Invalid part" }, { status: 400 })
  } catch (e: any) {
    console.error("Generate mock error:", e)
    return NextResponse.json(
      { error: e.message || "Failed to generate mock test." },
      { status: 500 }
    )
  }
}