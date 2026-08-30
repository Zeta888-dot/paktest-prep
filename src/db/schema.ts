import { pgTable, text, uuid, vector, timestamp, integer, jsonb } from "drizzle-orm/pg-core"

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  pageCount: integer("page_count"),
  testName: text("test_name"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const chunks = pgTable("chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").references(() => documents.id).notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 768 }),
  pageNumber: integer("page_number"),
})

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  answer: text("answer").notNull(),
  explanation: text("explanation"),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow(),
})

export const history = pgTable("history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().default("anonymous"),
  testName: text("test_name").notNull(),
  source: text("source").notNull(),
  correct: integer("correct").notNull(),
  total: integer("total").notNull(),
  duration: integer("duration"),
  createdAt: timestamp("created_at").defaultNow(),
})
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  author: text("author").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  likes: integer("likes").notNull().default(0),
})
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
})