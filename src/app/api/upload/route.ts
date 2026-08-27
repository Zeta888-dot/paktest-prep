import { NextResponse } from "next/server"
import { db } from "@/db"
import { documents, chunks } from "@/db/schema"
import { extractText, chunkText, embedChunks } from "@/lib/rag"

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    const testName = (form.get("testName") as string) || null
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const text = await extractText(buffer, file.type)
    const texts = chunkText(text)
    if (texts.length === 0)
      return NextResponse.json({ error: "No text found in file" }, { status: 400 })

    const embeddings = await embedChunks(texts)

    const [doc] = await db
      .insert(documents)
      .values({ name: file.name, testName })
      .returning()
    await db.insert(chunks).values(
      texts.map((content, i) => ({
        documentId: doc.id,
        content,
        pageNumber: i + 1,
        embedding: embeddings[i],
      }))
    )

    return NextResponse.json({ message: `${texts.length} chunks stored` })
  } catch (e) {
    console.error("Upload error:", e)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}