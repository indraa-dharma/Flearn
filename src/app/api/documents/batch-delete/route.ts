import { requireUser } from "@/lib/auth";
import { handleApiError, jsonSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const { ids } = body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return jsonSuccess({ deleted: 0 });
    }
    
    const result = await prisma.document.deleteMany({
      where: {
        id: { in: ids },
        userId: user.id,
      },
    });
    
    return jsonSuccess({ deleted: result.count });
  } catch (error) {
    return handleApiError(error);
  }
}
