import { GoogleGenAI } from "@google/genai"
// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse.js"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function extractText(buffer: Buffer, mime: string): Promise<string> {
  if (mime === "application/pdf") {
    try {
      const data = await pdf(buffer)
      return data.text ?? ""
    } catch (e) {
      console.error("PDF parse error:", e)
      throw new Error("Failed to extract text from PDF. The file may be corrupted or password-protected.")
    }
  }
  
  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
  } catch (e: any) {
    console.error("Image extraction error:", e)
    throw new Error("Failed to extract text from image. Please try a clearer image.")
  }
}

export function chunkText(text: string, size = 1200): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += size) chunks.push(text.slice(i, i + size))
  return chunks.filter((c) => c.trim().length > 50)
}

export async function embedChunks(chunks: string[]): Promise<number[][]> {
  try {
    const res = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: chunks,
      config: { outputDimensionality: 768 },
    })
    return res.embeddings?.map((e) => e.values ?? []) ?? []
  } catch (e: any) {
    console.error("Embedding error:", e)
    throw new Error("Failed to generate embeddings. Please check your API key and model access.")
  }
}