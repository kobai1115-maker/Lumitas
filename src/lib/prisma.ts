import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Edge環境では都度接続が発生するため、グローバルにインスタンスをキャッシュします
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// アダプターを使用してコネクションプールを作成
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
