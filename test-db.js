const postgres = require("postgres")

const sql = postgres(process.env.DATABASE_URL || require("dotenv").config({ path: ".env.local" }).parsed.DATABASE_URL)

sql`SELECT 1 as test`
  .then((r) => {
    console.log("Connection OK:", r)
    sql.end()
  })
  .catch((e) => {
    console.error("Connection FAILED:", e.message)
    sql.end()
    process.exit(1)
  })