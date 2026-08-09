import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT "rawAiOutput" FROM "StudyPlan" ORDER BY "createdAt" DESC LIMIT 1');
  console.log("LAST STUDY PLAN RAW OUTPUT:");
  console.log(JSON.stringify(res.rows[0].rawAiOutput, null, 2));
  await client.end();
}

main().catch(console.error);
