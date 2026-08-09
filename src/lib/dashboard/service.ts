import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function getDashboardData() {
  const user = await requireUser();
  const userId = user.id;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

  // 1. Today's Focus
  const todaysItems = await prisma.studyPlanItem.findMany({
    where: {
      userId,
      scheduledStart: { gte: startOfToday, lte: endOfToday },
    },
    orderBy: { scheduledStart: "asc" },
  });

  // 2. Weekly Schedule
  const weeklyEvents = await prisma.calendarEvent.findMany({
    where: {
      userId,
      startTime: { gte: startOfWeek, lte: endOfWeek },
    },
    orderBy: { startTime: "asc" },
  });

  // 3. Recent Sources
  const recentDocs = await prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // 4. Dokumen Diproses (Total)
  const totalDocs = await prisma.document.count({ where: { userId } });

  // 5. Waktu Luang Hari Ini
  const todaysEvents = weeklyEvents.filter((e) => e.startTime >= startOfToday && e.startTime <= endOfToday);
  const totalEventMinutes = todaysEvents.reduce((acc, e) => {
    const diff = e.endTime.getTime() - e.startTime.getTime();
    return acc + diff / 1000 / 60;
  }, 0);
  const freeMinutes = (16 * 60) - totalEventMinutes; // 16 hours awake
  const freeHours = Math.max(0, Math.floor(freeMinutes / 60));
  const freeMins = Math.max(0, Math.floor(freeMinutes % 60));
  const freeTimeString = `${freeHours}j ${freeMins}m`;

  return {
    todaysItems,
    weeklyEvents,
    recentDocs,
    totalDocs,
    freeTimeString,
    startOfWeek,
    endOfWeek,
  };
}
