import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

/**
 * Moyuukai Lumitas - Database Client Configuration
 * Cloudflare Pages の nodejs_compat モードを活用し、標準的な Node.js ドライバで Supabase に接続します。
 */
const prismaClientSingleton = () => {
  // Supabase Connection Pooler を使用するための設定
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const g = globalThis as any
const prisma = g.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') g.prismaGlobal = prisma
