import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";
import { extractTextFromFile, chunkText } from "@/lib/documents/extract";
import { storeDocumentFile } from "@/lib/documents/storage";

export function documentToSource(doc: any) {
  const ext = (doc.fileName || doc.title || "").split(".").pop()?.toLowerCase();
  return { id: doc.id, title: doc.title, name: doc.title, fileName: doc.originalName || doc.fileName, type: ext === "pdf" ? "pdf" : ext === "doc" || ext === "docx" ? "doc" : "other", size: doc.size, sizeLabel: `${(doc.size / 1024 / 1024).toFixed(2)} MB`, url: doc.url, subject: doc.subject || "General", category: doc.subject || "All", status: doc.status === "ready" ? "Processed" : doc.status, summaryStatus: doc.summaryStatus, pages: doc.extractedText ? Math.max(1, Math.ceil(doc.extractedText.length / 2500)) : 1, uploadedDate: doc.createdAt?.toISOString?.() ?? doc.createdAt, createdAt: doc.createdAt };
}

export async function listDocuments(userId: string) {
  return prisma.document.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function createDocumentFromUpload(userId: string, file: File, fields?: { subject?: string; course?: string }) {
  if (file.size === 0) throw new ApiError("The uploaded file is empty", 400);
  if (file.size > 4 * 1024 * 1024) throw new ApiError("File is too large. The current upload limit is 4 MB.", 413);

  const buffer = Buffer.from(await file.arrayBuffer());
  const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const fileName = `${crypto.randomBytes(8).toString("hex")}-${safe}`;
  const extracted = await extractTextFromFile(file);
  if (extracted.status !== "done" || !extracted.text.trim()) {
    throw new ApiError(extracted.message || "Could not extract readable text from this document", 422);
  }

  const stored = await storeDocumentFile(userId, fileName, file.type || "application/octet-stream", buffer);
  const doc = await prisma.document.create({ data: { userId, title: fields?.course ? `${fields.course} - ${file.name}` : file.name, fileName, originalName: file.name, type: file.type || "application/octet-stream", size: file.size, url: stored.url, storagePath: stored.storagePath, subject: fields?.subject, course: fields?.course, status: "ready", extractionStatus: "done", extractedText: extracted.text } });
  const chunks = chunkText(extracted.text).map((text, index) => ({ userId, documentId: doc.id, index, text, tokenCount: Math.ceil(text.length / 4) }));
  if (chunks.length) await prisma.documentChunk.createMany({ data: chunks });
  return doc;
}
