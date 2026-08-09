import { prisma } from './src/lib/prisma';

async function main() {
  const events = await prisma.calendarEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(events, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
