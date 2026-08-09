import { requireUser } from "@/lib/auth";
import { handleApiError, jsonSuccess } from "@/lib/api-response";
import { generateDocumentSummary } from "@/lib/ai/service";

export async function POST(request: Request) { try { const user = await requireUser(); const { documentId } = await request.json(); const summary = await generateDocumentSummary(user.id, documentId); return jsonSuccess({ summary }); } catch (e) { return handleApiError(e); } }
