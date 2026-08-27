import { NextResponse } from "next/server"
import { desc, eq, sql } from "drizzle-orm"
import { db } from "@/db"
import { posts } from "@/db/schema"

export async function GET() {
  const rows = await db.select().from(posts).orderBy(desc(posts.createdAt))
  return NextResponse.json({ posts: rows })
}

export async function POST(req: Request) {
  const { author, title, body } = await req.json()
  if (!title || !body) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  const [row] = await db
    .insert(posts)
    .values({ author: author || "Anonymous", title, body })
    .returning()
  return NextResponse.json({ post: row })
}

export async function PATCH(req: Request) {
  const { id, liked } = await req.json()
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const delta = liked ? 1 : -1
  const [row] = await db
    .update(posts)
    .set({ likes: sql`GREATEST(${posts.likes} + ${delta}, 0)` })
    .where(eq(posts.id, id))
    .returning()
  return NextResponse.json({ post: row })
}