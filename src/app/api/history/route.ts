import { db } from "@/db"
import { history } from "@/db/schema"
import { desc, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function POST(req: Request) {
  const session = await auth()
  const userId = session?.user?.email ?? "anonymous"

  const { testName, source, correct, total, duration } = await req.json()
  await db.insert(history).values({
    userId,
    testName,
    source,
    correct,
    total,
    duration: duration ?? null,
  })
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await auth()
  const userId = session?.user?.email ?? "anonymous"

  const rows = await db
    .select()
    .from(history)
    .where(eq(history.userId, userId))
    .orderBy(desc(history.createdAt))
  return NextResponse.json({ history: rows })
}