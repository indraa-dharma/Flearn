import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
console.log("Connecting to:", connectionString.substring(0, 40) + "...");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log("✅ DB Connected! User count:", userCount);
    
    const users = await prisma.user.findMany({ select: { email: true, name: true } });
    console.log("Users:", users);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
