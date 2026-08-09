import { requireUser } from "@/lib/auth";
import { handleApiError, jsonSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) { try { const user = await requireUser(); const { searchParams } = new URL(request.url); const status = searchParams.get("status") || undefined; const plans = await prisma.studyPlan.findMany({ where: { userId: user.id, ...(status ? { status } : {}) }, include: { items: { orderBy: { order: "asc" } } }, orderBy: { createdAt: "desc" } }); return jsonSuccess({ plans, studyPlans: plans, plan: plans[0] || null }); } catch (e) { return handleApiError(e); } }
