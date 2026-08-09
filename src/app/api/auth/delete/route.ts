import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonSuccess, handleApiError } from "@/lib/api-response";

export async function DELETE() {
  try {
    const user = await requireUser();

    // Delete user and all related data (cascade configured in Prisma schema)
    await prisma.user.delete({
      where: { id: user.id },
    });

    return jsonSuccess({ deleted: true, message: "Account deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
