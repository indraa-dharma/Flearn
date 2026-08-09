import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "alex.chen@stanford.edu" }
    });
    console.log("User found:", user ? user.email : "Not found");
    console.log("SUCCESS");
  } catch (error) {
    console.error("DB QUERY ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
