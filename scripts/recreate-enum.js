const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$executeRawUnsafe(`CREATE TYPE "public"."Role" AS ENUM ('DEVELOPER', 'MAIN_ADMIN', 'SUB_ADMIN', 'GENERAL');`);
  } catch (e) {
    console.log("Enum might already exist.");
  }
  await prisma.$executeRawUnsafe(`ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."Role" USING "role"::"text"::"public"."Role";`);
  console.log("Enum recreated and column casted.");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
