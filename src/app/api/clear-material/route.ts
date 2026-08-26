import { NextResponse } from "next/server"
import { db } from "@/db"
import { chunks, documents } from "@/db/schema"

export async function POST() {
  await db.delete(chunks)
  await db.delete(documents)
  return NextResponse.json({ ok: true })
}