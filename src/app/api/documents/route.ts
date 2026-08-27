import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"
import { db } from "@/db"
import { documents, chunks } from "@/db/schema"

export async function GET() {
  const rows = await db.select().from(documents).orderBy(desc(documents.createdAt))
  return NextResponse.json({ documents: rows })
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  await db.delete(chunks).where(eq(chunks.documentId, id))
  await db.delete(documents).where(eq(documents.id, id))
  return NextResponse.json({ ok: true })
}