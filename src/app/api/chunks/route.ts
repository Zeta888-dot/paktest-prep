import { NextResponse } from "next/server"
import { asc, eq } from "drizzle-orm"
import { db } from "@/db"
import { chunks } from "@/db/schema"

export async function GET(req: Request) {
  const docId = new URL(req.url).searchParams.get("docId")
  if (!docId) return NextResponse.json({ chunks: [] })
  const rows = await db
    .select()
    .from(chunks)
    .where(eq(chunks.documentId, docId))
    .orderBy(asc(chunks.pageNumber))
  return NextResponse.json({ chunks: rows })
}