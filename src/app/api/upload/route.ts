import { requireUser } from "@/lib/auth";
import { handleApiError, jsonSuccess } from "@/lib/api-response";
import { createDocumentFromUpload, documentToSource, listDocuments } from "@/lib/documents/service";

export const runtime = "nodejs";

export async function GET() { try { const user = await requireUser(); const documents = await listDocuments(user.id); return jsonSuccess({ documents, sources: documents.map(documentToSource) }); } catch (e) { return handleApiError(e); } }
export async function POST(request: Request) { try { const user = await requireUser(); const formData = await request.formData(); const file = formData.get("file") as File | null; if (!file) throw new Error("No file provided"); const doc = await createDocumentFromUpload(user.id, file); return jsonSuccess({ file: doc, document: doc, source: documentToSource(doc), analysis: { wordCount: doc.extractedText?.split(/\s+/).length || 0, type: doc.type } }, 201); } catch (e) { return handleApiError(e); } }
