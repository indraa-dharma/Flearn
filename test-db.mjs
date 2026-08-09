import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const accounts = await prisma.account.findMany();
  console.log("ACCOUNTS_IN_DB:", accounts);
  const users = await prisma.user.findMany();
  console.log("USERS_IN_DB:", users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
