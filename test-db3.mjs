import { config } from "dotenv";
config();
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("SUCCESS: Database connection is working.");
    console.log("Users found:", users.length);
  } catch (error) {
    console.error("DB ERROR:", error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
