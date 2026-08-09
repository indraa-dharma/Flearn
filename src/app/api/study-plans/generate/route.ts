import { requireUser } from "@/lib/auth";
import { handleApiError, jsonSuccess } from "@/lib/api-response";
import { generateStudyPlan } from "@/lib/ai/service";

export async function POST(request: Request) { try { const user = await requireUser(); const body = await request.json().catch(() => ({})); const studyPlan = await generateStudyPlan(user.id, body.documentIds, body.preferences); return jsonSuccess({ studyPlan, plan: studyPlan }, 201); } catch (e) { return handleApiError(e); } }
