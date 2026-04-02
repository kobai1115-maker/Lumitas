import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

if (process.env.NEXT_RUNTIME === 'edge') {
  prisma = new PrismaClient()
} else {
  // nodejs サーバーサイドでの初期化 - eval('require') を使い webpack の深追いを防ぎます
  const { Pool } = eval('require')('pg')
  const { PrismaPg } = eval('require')('@prisma/adapter-pg')
  
  const prismaClientSingleton = () => {
    if (process.env.DATABASE_URL?.includes('supabase') || process.env.NODE_ENV === 'production') {
      const pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      })
      const adapter = new PrismaPg(pool)
      return new PrismaClient({ adapter })
    }
    return new PrismaClient()
  }

  const g = globalThis as any
  prisma = g.prismaGlobal ?? prismaClientSingleton()
  if (process.env.NODE_ENV !== 'production') g.prismaGlobal = prisma
}

export default prisma
