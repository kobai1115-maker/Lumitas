import { PrismaClient } from '@prisma/client/edge'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

const g = globalThis as any
const prisma = g.prismaGlobal ?? prismaClientSingleton()

export default prisma
if (process.env.NODE_ENV !== 'production') g.prismaGlobal = prisma
