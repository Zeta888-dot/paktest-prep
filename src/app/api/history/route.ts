import { NextResponse } from "next/server"
import { desc } from "drizzle-orm"
import { db } from "@/db"
import { history } from "@/db/schema"

export async function POST(req: Request) {
  const { testName, source, correct, total } = await req.json()
  await db.insert(history).values({ testName, source, correct, total })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const rows = await db.select().from(history).orderBy(desc(history.createdAt))
  return NextResponse.json({ history: rows })
}