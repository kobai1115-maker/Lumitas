import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  if (process.env.DATABASE_URL?.includes('supabase') || process.env.NODE_ENV === 'production') {
    const pool = new pg.Pool({ 
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

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
