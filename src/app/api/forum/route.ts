import { NextResponse } from "next/server"
import { desc } from "drizzle-orm"
import { db } from "@/db"
import { posts } from "@/db/schema"

export async function GET() {
  const rows = await db.select().from(posts).orderBy(desc(posts.createdAt))
  return NextResponse.json({ posts: rows })
}

export async function POST(req: Request) {
  const { author, title, body } = await req.json()
  if (!title || !body)
    return NextResponse.json({ error: "Title and body required" }, { status: 400 })
  const [post] = await db
    .insert(posts)
    .values({ author: author || "Anonymous", title, body })
    .returning()
  return NextResponse.json({ post })
}