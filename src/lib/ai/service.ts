import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";
import { buildSummaryPrompt, buildStudyPlanPrompt } from "@/lib/ai/prompts";
import { callQwenJson } from "@/lib/ai/qwen";
import type { DocumentSummaryOutput, StudyPlanOutput } from "@/lib/ai/types";

const hash = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function generateDocumentSummary(userId: string, documentId: string) {
  const doc = await prisma.document.findFirst({ where: { id: documentId, userId } });
  if (!doc) throw new ApiError("Document not found", 404);
  if (!doc.extractedText) throw new ApiError("Document has no extracted text", 400);
  await prisma.document.update({ where: { id: doc.id }, data: { summaryStatus: "generating" } });
  const prompt = buildSummaryPrompt({ title: doc.title, text: doc.extractedText });
  const output = await callQwenJson<DocumentSummaryOutput>(prompt);
  await prisma.document.update({ where: { id: doc.id }, data: { summaryStatus: "done", summary: output as any } });
  await prisma.aiOutput.create({ data: { userId, documentId: doc.id, taskType: "document_summary", model: process.env.QWEN_MODEL || "glm-5.2", promptHash: hash(prompt), output: output as any } });
  return output;
}

export async function generateStudyPlan(userId: string, documentIds?: string[] | null, preferences?: unknown) {
  const requestedDocumentIds = Array.isArray(documentIds)
    ? [...new Set(documentIds.filter((id): id is string => typeof id === "string" && id.length > 0))]
    : [];
  const shouldFetchDocs = requestedDocumentIds.length > 0;
  const docs = shouldFetchDocs
    ? await prisma.document.findMany({
        where: { userId, id: { in: requestedDocumentIds } },
        orderBy: { createdAt: "desc" },
        take: requestedDocumentIds.length,
      })
    : [];

  if (shouldFetchDocs && docs.length !== requestedDocumentIds.length) {
    throw new ApiError("One or more selected documents could not be found", 400);
  }

  const unreadableDocument = docs.find(
    (doc) => doc.status !== "ready" || doc.extractionStatus !== "done" || (doc.extractedText?.trim().length || 0) < 50,
  );
  if (unreadableDocument) {
    throw new ApiError(`Document "${unreadableDocument.originalName || unreadableDocument.title}" is not ready for AI analysis`, 422);
  }

  const start = new Date();
  const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const events = await prisma.calendarEvent.findMany({
    where: { userId, startTime: { gte: start, lte: end } },
    orderBy: { startTime: "asc" },
    take: 50,
  });

  const documents = docs.length > 0
    ? docs.map(d => `# ${d.title}\nSummary: ${JSON.stringify(d.summary || {})}\nText: ${(d.extractedText || "").slice(0, 8000)}`).join("\n\n")
    : "";

  const calendar = events.map(e => `${e.title}: ${e.startTime.toISOString()} - ${e.endTime.toISOString()}`).join("\n") || "No calendar events synced yet.";

  const prompt = buildStudyPlanPrompt({ documents, calendar, now: start.toISOString(), preferences });
  const output = await callQwenJson<StudyPlanOutput>(prompt);

  const plan = await prisma.studyPlan.create({
    data: {
      userId,
      title: output.title || "Flearn Study Plan",
      summary: output.summary,
      priorityReasoning: output.priority_reasoning,
      nextAction: output.next_action,
      sourceDocumentIds: docs.map(d => d.id),
      calendarContext: events,
      rawAiOutput: output as any,
      items: {
        create: (output.workflow_steps || []).map((s, i) => ({
          userId,
          order: i + 1,
          title: s.title,
          description: s.description,
          course: s.course,
          topic: s.topic,
          type: s.type,
          durationMinutes: s.duration_minutes || 60,
          reasoning: s.reasoning,
          scheduledStart: output.recommended_time_blocks?.[i]?.start_time
            ? new Date(output.recommended_time_blocks[i].start_time)
            : undefined,
          scheduledEnd: output.recommended_time_blocks?.[i]?.end_time
            ? new Date(output.recommended_time_blocks[i].end_time)
            : undefined,
        })),
      },
    },
    include: { items: true },
  });

  await prisma.aiOutput.create({
    data: {
      userId,
      studyPlanId: plan.id,
      taskType: "study_workflow",
      model: process.env.QWEN_MODEL || "glm-5.2",
      promptHash: hash(prompt),
      output: output as any,
    },
  });

  return plan;
}
