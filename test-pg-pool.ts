import "dotenv/config";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
console.log("URL:", connectionString?.substring(0, 70));

// Test 1: with ssl rejectUnauthorized false (no sslmode in URL)
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    const res = await pool.query("SELECT COUNT(*) FROM \"User\"");
    console.log("✅ Connected! User count:", res.rows[0].count);
  } catch (error: any) {
    console.error("❌ Error:", error.message, "Code:", error.code);
  } finally {
    await pool.end();
  }
}

main();
