"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function toggleTaskStatus(taskId: string, isCompleted: boolean) {
  const user = await requireUser();
  await prisma.studyPlanItem.update({
    where: { id: taskId, userId: user.id },
    data: { status: isCompleted ? "completed" : "pending" },
  });
}
