import { requireUser } from "@/lib/auth";
import { handleApiError, jsonSuccess } from "@/lib/api-response";
import { callQwenJson } from "@/lib/ai/qwen";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    await requireUser();
    const body = await req.json();
    const { message, sourceIds } = body;

    let sourceNames: string[] = [];
    if (sourceIds && Array.isArray(sourceIds) && sourceIds.length > 0) {
      const docs = await prisma.document.findMany({
        where: { id: { in: sourceIds } },
        select: { title: true },
      });
      sourceNames = docs.map((d: { title: string }) => d.title);
    }

    const prompt = `Buat judul super singkat (maksimal 3-5 kata, tanpa tanda kutip) untuk percakapan chat AI berdasarkan pesan pertama user ini:\n\nPesan User: "${message}"\n${sourceNames.length > 0 ? 'Materi terkait: ' + sourceNames.join(', ') : ''}\n\nReturn JSON schema: {"title": "string"}`;

    const result = await callQwenJson<{ title: string }>(prompt);

    return jsonSuccess({ title: result.title || "Sesi Chat" });
  } catch (error) {
    return handleApiError(error);
  }
}
