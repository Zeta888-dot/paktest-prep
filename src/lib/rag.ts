import { GoogleGenAI } from "@google/genai"
// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse.js"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function extractText(buffer: Buffer, mime: string): Promise<string> {
  if (mime === "application/pdf") {
    const data = await pdf(buffer)
    return data.text
  }
  const res = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: mime, data: buffer.toString("base64") } },
          { text: "Extract all text from this image exactly as written. Return only the text." },
        ],
      },
    ],
  })
  return res.text ?? ""
}

export function chunkText(text: string, size = 1200): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size))
  return chunks.filter((c) => c.trim().length > 50)
}
export async function embedChunks(chunks: string[]): Promise<number[][]> {
  const res = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: chunks,
    config: { outputDimensionality: 768 },
  })
  return res.embeddings?.map((e) => e.values ?? []) ?? []
}