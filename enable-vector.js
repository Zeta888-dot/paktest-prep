const postgres = require("postgres")

const sql = postgres(process.env.DATABASE_URL)

sql`CREATE EXTENSION IF NOT EXISTS vector`
  .then(() => console.log("vector extension enabled"))
  .then(() => sql.end())
  .catch((e) => {
    console.error("Error:", e.message)
    sql.end()
    process.exit(1)
  })