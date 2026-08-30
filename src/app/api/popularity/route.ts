import { db } from "@/db"
import { history } from "@/db/schema"
import { sql } from "drizzle-orm"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const rows = await db
    .select({
      testName: history.testName,
      count: sql<number>`count(*)::int`,
    })
    .from(history)
    .groupBy(history.testName)

  const popularity: Record<string, number> = {}
  for (const r of rows) popularity[r.testName] = r.count

  return NextResponse.json({ popularity })
}