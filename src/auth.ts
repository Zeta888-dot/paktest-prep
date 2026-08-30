import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  events: {
    async signIn({ user }) {
      if (!user.email) return
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email))
        .limit(1)
      if (existing.length === 0) {
        await db.insert(users).values({
          email: user.email,
          name: user.name ?? null,
          image: user.image ?? null,
        })
      } else {
        await db
          .update(users)
          .set({ name: user.name ?? null, image: user.image ?? null })
          .where(eq(users.email, user.email))
      }
    },
  },
})