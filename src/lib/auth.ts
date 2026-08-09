import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const id = (session?.user as any)?.id as string | undefined;
  if (!session?.user || (!email && !id)) return null;
  return prisma.user.findFirst({ where: id ? { id } : { email: email! } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new ApiError("Unauthorized. Please sign in first.", 401);
  return user;
}
