import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handleApiError, jsonSuccess } from "@/lib/api-response";
import { callQwenChat } from "@/lib/ai/qwen";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { title, course, description, topic, sourceIds = [] } = body;

    let documentsContext = "";

    if (sourceIds.length > 0) {
      const documents = await prisma.document.findMany({
        where: {
          id: { in: sourceIds },
          userId: user.id
        },
        select: {
          id: true,
          title: true,
          extractedText: true,
          summary: true
        }
      });

      if (documents.length > 0) {
        documentsContext = "\n\nKonteks Dokumen:\n" + documents.map((doc: any) => {
          return `Judul Dokumen: ${doc.title}\nRingkasan: ${doc.summary || 'Tidak ada ringkasan'}\nIsi:\n${doc.extractedText || 'Tidak ada teks'}`;
        }).join("\n\n---\n\n");
      }
    }

    const baseSystemPrompt = `Kamu adalah FLearn, AI Academic Advisor. Tugasmu adalah memberikan penjelasan MENDALAM tentang sebuah topik/sesi belajar.

Format penjelasan:
1. **Ringkasan Singkat** — Penjelasan 2-3 kalimat tentang apa topik ini
2. **Konsep Utama** — Jelaskan konsep-konsep kunci dengan detail, gunakan analogi jika membantu
3. **Poin-Poin Penting** — Daftar poin penting yang harus dipahami
4. **Contoh / Studi Kasus** — Berikan contoh konkret atau studi kasus
5. **Tabel Ringkasan** — Buat tabel markdown jika relevan (misal perbandingan metode, rumus, dll)
6. **Tips Belajar** — Saran cara efektif mempelajari topik ini
7. **Pertanyaan Latihan** — 2-3 pertanyaan untuk menguji pemahaman

Gunakan Bahasa Indonesia yang mudah dipahami, boleh campur istilah teknis dalam Bahasa Inggris.
Gunakan markdown formatting: bold, italic, bullet points, numbered lists, tables, code blocks jika relevan.`;

    const systemPrompt = documentsContext ? baseSystemPrompt + documentsContext : baseSystemPrompt;

    let userMessage = `Jelaskan secara mendalam tentang sesi belajar berikut:\n\nJudul: ${title}\nMata Kuliah: ${course}\n`;
    if (description) {
      userMessage += `Deskripsi: ${description}\n`;
    }
    if (topic) {
      userMessage += `Topik: ${topic}\n`;
    }

    const result = await callQwenChat(systemPrompt, [{ role: "user", content: userMessage }]);

    return jsonSuccess({ explanation: result });
  } catch (error) {
    return handleApiError(error);
  }
}
