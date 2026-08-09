import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local");
  }

  const pool = new Pool({
    connectionString,
    // Supabase pooler requires SSL but uses a self-signed chain.
    ssl: { rejectUnauthorized: false },
    // Fail fast on startup so we get a clear error rather than a hang.
    connectionTimeoutMillis: 10000,
    max: 5,
    idleTimeoutMillis: 30000,
  });

  // Workaround: pg v8.x treats sslmode=require as verify-full which
  // rejects Supabase's certificate chain.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  // Surface pool errors to logs instead of crashing the process silently.
  pool.on("error", (err) => {
    console.error("[Prisma pool error]", err.message);
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as any);
}

// Reuse a single client across hot-reloads in dev.
export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
