import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { callQwenJson } from "@/lib/ai/qwen";

export async function getTodayWorkflow(userId: string) {
  const now = new Date();
  const start = startOfDay(now);
  const end = endOfDay(now);

  const items = await prisma.studyPlanItem.findMany({
    where: {
      userId,
      scheduledStart: {
        gte: start,
        lte: end,
      },
    },
    orderBy: {
      scheduledStart: "asc",
    },
  });

  return items;
}

export async function getWorkflowInsights(items: any[]) {
  if (items.length === 0) {
    return {
      peakProductivityTime: "-",
      estimatedCompletionTime: "-",
      readinessLevel: "0%",
    };
  }

  const tasksString = items.map((t, i) => `${i + 1}. ${t.title} (${t.durationMinutes} menit, tipe: ${t.type}, jam: ${t.scheduledStart?.toISOString()})`).join("\n");

  const prompt = `Sebagai AI Academic Advisor, analisislah daftar tugas belajar berikut yang dijadwalkan untuk HARI INI:

${tasksString}

Berdasarkan jadwal tersebut, berikan insight harian dengan format JSON:
{
  "peakProductivityTime": "Jam berapa pengguna akan paling produktif/sibuk belajar (format string, contoh: '09:00 - 11:00' atau '19:00 - 21:00')",
  "estimatedCompletionTime": "Jam berapa seluruh tugas ini diperkirakan selesai (format string HH:MM, contoh: '15:30')",
  "readinessLevel": "Seberapa padat jadwal ini, berikan persentase kesiapan (format string, contoh: '85%')"
}
Hanya berikan respons JSON yang valid.`;

  try {
    const output = await callQwenJson<{ peakProductivityTime: string, estimatedCompletionTime: string, readinessLevel: string }>(prompt);
    return {
      peakProductivityTime: output.peakProductivityTime || "-",
      estimatedCompletionTime: output.estimatedCompletionTime || "-",
      readinessLevel: output.readinessLevel || "-",
    };
  } catch (error) {
    console.error("Failed to generate workflow insights:", error);
    return {
      peakProductivityTime: "-",
      estimatedCompletionTime: "-",
      readinessLevel: "-",
    };
  }
}
