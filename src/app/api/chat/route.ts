import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { handleApiError, jsonSuccess } from "@/lib/api-response";
import { callQwenChat } from "@/lib/ai/qwen";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { message, history = [], sourceIds = [] } = body;

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

    const baseSystemPrompt = `Kamu adalah FLearn, AI Academic Advisor yang cerdas dan ramah. Kamu membantu mahasiswa Indonesia dalam hal:
- Menjawab pertanyaan seputar materi kuliah dan akademik
- Menjelaskan konsep-konsep pelajaran dengan cara yang mudah dipahami
- Memberikan tips belajar, manajemen waktu, dan produktivitas
- Membantu memahami dokumen/materi yang sudah di-upload

BATASAN PENTING:
- Kamu HANYA menjawab pertanyaan yang berkaitan dengan pendidikan, akademik, materi kuliah, produktivitas belajar, dan pengaturan jadwal
- Jika pengguna bertanya hal di luar konteks ini (misalnya politik, gosip, hal tidak pantas), tolak dengan sopan dan arahkan kembali ke topik akademik
- Jawab dalam Bahasa Indonesia yang natural, boleh campur istilah Inggris untuk istilah teknis
- Jika ada dokumen/materi yang di-upload, prioritaskan menjawab berdasarkan konteks dokumen tersebut
- Gunakan format yang rapi: gunakan bullet points, numbering, bold untuk kata penting`;

    const systemPrompt = documentsContext ? baseSystemPrompt + documentsContext : baseSystemPrompt;

    const messages = [...history, { role: "user", content: message }];

    const result = await callQwenChat(systemPrompt, messages);

    return jsonSuccess({ reply: result });
  } catch (error) {
    return handleApiError(error);
  }
}
