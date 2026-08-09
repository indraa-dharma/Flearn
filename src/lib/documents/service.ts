import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { extractTextFromFile, chunkText } from "@/lib/documents/extract";

export function documentToSource(doc: any) {
  const ext = (doc.fileName || doc.title || "").split(".").pop()?.toLowerCase();
  return { id: doc.id, title: doc.title, name: doc.title, fileName: doc.originalName || doc.fileName, type: ext === "pdf" ? "pdf" : ext === "doc" || ext === "docx" ? "doc" : "other", size: doc.size, sizeLabel: `${(doc.size / 1024 / 1024).toFixed(2)} MB`, url: doc.url, subject: doc.subject || "General", category: doc.subject || "All", status: doc.status === "ready" ? "Processed" : doc.status, summaryStatus: doc.summaryStatus, pages: doc.extractedText ? Math.max(1, Math.ceil(doc.extractedText.length / 2500)) : 1, uploadedDate: doc.createdAt?.toISOString?.() ?? doc.createdAt, createdAt: doc.createdAt };
}

export async function listDocuments(userId: string) {
  return prisma.document.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function createDocumentFromUpload(userId: string, file: File, fields?: { subject?: string; course?: string }) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const fileName = `${crypto.randomBytes(8).toString("hex")}-${safe}`;
  const storagePath = path.join(uploadDir, fileName);
  await fs.writeFile(storagePath, buffer);
  const extracted = await extractTextFromFile(file);
  const doc = await prisma.document.create({ data: { userId, title: fields?.course ? `${fields.course} - ${file.name}` : file.name, fileName, originalName: file.name, type: file.type || "application/octet-stream", size: file.size, url: `/uploads/${fileName}`, storagePath, subject: fields?.subject, course: fields?.course, status: extracted.status === "done" ? "ready" : "uploaded", extractionStatus: extracted.status, extractedText: extracted.text } });
  const chunks = chunkText(extracted.text).map((text, index) => ({ userId, documentId: doc.id, index, text, tokenCount: Math.ceil(text.length / 4) }));
  if (chunks.length) await prisma.documentChunk.createMany({ data: chunks });
  return doc;
}
