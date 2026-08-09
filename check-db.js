require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const plans = await prisma.studyPlan.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1,
    include: { items: true }
  });
  console.log("LAST PLAN ITEMS:", JSON.stringify(plans[0]?.items, null, 2));

  const events = await prisma.calendarEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  console.log("LAST CALENDAR EVENTS:", JSON.stringify(events, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
