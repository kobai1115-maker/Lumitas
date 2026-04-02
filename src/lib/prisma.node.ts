import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

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
const prisma = g.prismaGlobal ?? prismaClientSingleton()

export default prisma
if (process.env.NODE_ENV !== 'production') g.prismaGlobal = prisma
