import { config } from "dotenv";
config();
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users:", users.length);
    console.log("SUCCESS");
  } catch (error) {
    console.error("DB ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
