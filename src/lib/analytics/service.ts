import { prisma } from "@/lib/prisma";
import { callQwenJson } from "@/lib/ai/qwen";
import {
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  subDays,
  format,
  differenceInMinutes,
  getHours,
} from "date-fns";

// ── Weekly Study Hours (per-day breakdown) ────────────────────
export async function getWeeklyStudyHours(userId: string) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Get completed StudyPlanItems this week
  const planItems = await prisma.studyPlanItem.findMany({
    where: {
      userId,
      scheduledStart: { gte: weekStart, lte: weekEnd },
      status: "completed",
    },
    select: { scheduledStart: true, durationMinutes: true },
  });

  // Get AI-created calendar events this week
  const calEvents = await prisma.calendarEvent.findMany({
    where: {
      userId,
      startTime: { gte: weekStart, lte: weekEnd },
      source: { in: ["flearn", "ai"] },
    },
    select: { startTime: true, endTime: true },
  });

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hoursPerDay: Record<string, number> = {};
  days.forEach((d) => (hoursPerDay[d] = 0));

  for (const item of planItems) {
    if (!item.scheduledStart) continue;
    const dayIdx = (item.scheduledStart.getDay() + 6) % 7; // Mon=0
    const dayName = days[dayIdx];
    if (dayName) hoursPerDay[dayName] += (item.durationMinutes || 0) / 60;
  }

  for (const ev of calEvents) {
    const dayIdx = (ev.startTime.getDay() + 6) % 7;
    const dayName = days[dayIdx];
    const mins = differenceInMinutes(ev.endTime, ev.startTime);
    if (dayName) hoursPerDay[dayName] += mins / 60;
  }

  return days.map((day) => ({
    day,
    hours: Math.round(hoursPerDay[day] * 10) / 10,
  }));
}

// ── Total Hours This Week ────────────────────────────────────
export async function getTotalHoursThisWeek(userId: string) {
  const weeklyData = await getWeeklyStudyHours(userId);
  const total = weeklyData.reduce((acc, d) => acc + d.hours, 0);
  return Math.round(total * 10) / 10;
}

// ── All-Time Tasks Completed ─────────────────────────────────
export async function getAllTimeTasksCompleted(userId: string) {
  const [completed, total] = await Promise.all([
    prisma.studyPlanItem.count({ where: { userId, status: "completed" } }),
    prisma.studyPlanItem.count({ where: { userId } }),
  ]);
  return { completed, total };
}

// ── Focus Streak ─────────────────────────────────────────────
// Counts consecutive days (backwards from today) where user
// completed ≥1 StudyPlanItem OR created ≥1 Document/AiOutput.
export async function getFocusStreak(userId: string) {
  const now = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const checkDate = subDays(now, i);
    const dayStart = startOfDay(checkDate);
    const dayEnd = endOfDay(checkDate);

    const [completedTasks, docsCreated, aiOutputs] = await Promise.all([
      prisma.studyPlanItem.count({
        where: {
          userId,
          status: "completed",
          updatedAt: { gte: dayStart, lte: dayEnd },
        },
      }),
      prisma.document.count({
        where: {
          userId,
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      }),
      prisma.aiOutput.count({
        where: {
          userId,
          createdAt: { gte: dayStart, lte: dayEnd },
        },
      }),
    ]);

    if (completedTasks > 0 || docsCreated > 0 || aiOutputs > 0) {
      streak++;
    } else {
      // If checking today and no activity yet, don't break streak
      if (i === 0) continue;
      break;
    }
  }

  return streak;
}

// ── Peak Productivity ────────────────────────────────────────
// Finds the most common hour range for AI-scheduled tasks
export async function getPeakProductivity(userId: string) {
  const items = await prisma.studyPlanItem.findMany({
    where: {
      userId,
      scheduledStart: { not: null },
    },
    select: { scheduledStart: true },
  });

  if (items.length === 0) return "-";

  const hourCounts: Record<number, number> = {};
  for (const item of items) {
    if (!item.scheduledStart) continue;
    const hour = getHours(item.scheduledStart);
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  }

  // Find top hour
  let peakHour = 9;
  let maxCount = 0;
  for (const [hour, count] of Object.entries(hourCounts)) {
    if (count > maxCount) {
      maxCount = count;
      peakHour = parseInt(hour);
    }
  }

  const startStr = `${peakHour.toString().padStart(2, "0")}:00`;
  const endHour = Math.min(peakHour + 2, 23);
  const endStr = `${endHour.toString().padStart(2, "0")}:00`;

  return `${startStr} - ${endStr}`;
}

// ── Productivity Metrics ─────────────────────────────────────
export async function getProductivityMetrics(userId: string) {
  const now = new Date();
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const lastWeekStart = subDays(thisWeekStart, 7);
  const lastWeekEnd = subDays(thisWeekStart, 1);

  // Avg focus session (average durationMinutes of completed tasks)
  const completedItems = await prisma.studyPlanItem.findMany({
    where: { userId, status: "completed" },
    select: { durationMinutes: true },
  });

  const avgFocus = completedItems.length > 0
    ? Math.round(completedItems.reduce((acc, i) => acc + (i.durationMinutes || 0), 0) / completedItems.length)
    : 0;

  // Completion rate (all time)
  const [completed, total] = await Promise.all([
    prisma.studyPlanItem.count({ where: { userId, status: "completed" } }),
    prisma.studyPlanItem.count({ where: { userId } }),
  ]);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Weekly improvement (compare this week's completed hours vs last week)
  const thisWeekItems = await prisma.studyPlanItem.findMany({
    where: {
      userId,
      status: "completed",
      scheduledStart: { gte: thisWeekStart },
    },
    select: { durationMinutes: true },
  });

  const lastWeekItems = await prisma.studyPlanItem.findMany({
    where: {
      userId,
      status: "completed",
      scheduledStart: { gte: lastWeekStart, lte: lastWeekEnd },
    },
    select: { durationMinutes: true },
  });

  const thisWeekMins = thisWeekItems.reduce((acc, i) => acc + (i.durationMinutes || 0), 0);
  const lastWeekMins = lastWeekItems.reduce((acc, i) => acc + (i.durationMinutes || 0), 0);

  let improvement = "0%";
  if (lastWeekMins > 0) {
    const pct = Math.round(((thisWeekMins - lastWeekMins) / lastWeekMins) * 100);
    improvement = pct >= 0 ? `+${pct}%` : `${pct}%`;
  } else if (thisWeekMins > 0) {
    improvement = "+100%";
  }

  return {
    avgFocusSession: `${avgFocus} min`,
    completionRate: `${completionRate}%`,
    improvementFromLastWeek: improvement,
  };
}

// ── Subject Distribution (AI-driven) ─────────────────────────
export async function getSubjectDistribution(userId: string) {
  const [docs, planItems] = await Promise.all([
    prisma.document.findMany({
      where: { userId },
      select: { title: true, subject: true, course: true, summary: true },
      take: 50,
    }),
    prisma.studyPlanItem.findMany({
      where: { userId },
      select: { title: true, course: true, topic: true },
      take: 100,
    }),
  ]);

  if (docs.length === 0 && planItems.length === 0) {
    return [{ subject: "Belum ada data", percentage: 100 }];
  }

  const docsList = docs.map((d, i) => `${i + 1}. "${d.title}" (subject: ${d.subject || d.course || "unknown"})`).join("\n");
  const tasksList = planItems.map((t, i) => `${i + 1}. "${t.title}" (course: ${t.course || "unknown"}, topic: ${t.topic || "unknown"})`).join("\n");

  const prompt = `Kamu adalah AI Academic Advisor. Berdasarkan daftar dokumen dan tugas belajar pengguna berikut, klasifikasikan distribusi subject/mata kuliah mereka. 

Dokumen:
${docsList || "Tidak ada dokumen"}

Tugas Belajar:
${tasksList || "Tidak ada tugas"}

Berikan respons dalam format JSON:
{
  "subjects": [
    { "subject": "Nama Mata Kuliah", "percentage": 30 },
    { "subject": "Nama Lain", "percentage": 25 }
  ]
}

Aturan:
- Kelompokkan topik serupa menjadi satu subject.
- Total percentage HARUS berjumlah 100.
- Maksimal 6 subject. Jika ada sisa, gabungkan ke "Lainnya".
- Urutkan dari persentase terbesar ke terkecil.
Hanya berikan respons JSON yang valid.`;

  try {
    const output = await callQwenJson<{ subjects: Array<{ subject: string; percentage: number }> }>(prompt);
    return output.subjects || [{ subject: "General", percentage: 100 }];
  } catch (error) {
    console.error("Failed to generate subject distribution:", error);
    return [{ subject: "General", percentage: 100 }];
  }
}

// ── AI Weekly Summary ────────────────────────────────────────
export async function getAIWeeklySummary(
  userId: string,
  totalHours: number,
  tasksCompleted: { completed: number; total: number },
  streak: number,
  peakProductivity: string,
) {
  const prompt = `Kamu adalah AI Academic Advisor yang memberikan evaluasi performa belajar mingguan. Berikut adalah data performa pengguna minggu ini:

- Total Jam Belajar Minggu Ini: ${totalHours} jam
- Tugas Selesai: ${tasksCompleted.completed} dari ${tasksCompleted.total} total tugas (all-time)
- Focus Streak: ${streak} hari berturut-turut aktif belajar
- Peak Productivity: ${peakProductivity}

Berikan evaluasi performa dalam format JSON:
{
  "title": "Judul singkat evaluasi (misal: 'Performance Evaluation' atau 'Weekly Review')",
  "summary": "Satu paragraf evaluasi performa belajar pengguna minggu ini (2-4 kalimat). Gunakan data di atas. Berikan pujian jika baik, dan saran konstruktif jika kurang. Tulis dalam bahasa Inggris yang natural dan informatif."
}
Hanya berikan respons JSON yang valid.`;

  try {
    const output = await callQwenJson<{ title: string; summary: string }>(prompt);
    return {
      title: output.title || "Performance Evaluation",
      summary: output.summary || "No summary available.",
    };
  } catch (error) {
    console.error("Failed to generate AI weekly summary:", error);
    return {
      title: "Performance Evaluation",
      summary: "Unable to generate summary at this time. Please try refreshing the page.",
    };
  }
}
