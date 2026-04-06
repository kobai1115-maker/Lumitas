const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const res = await prisma.$queryRawUnsafe('SELECT 1');
    console.log('Conn OK', res);
    
    console.log('Adding column hireDate if missing...');
    await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hireDate" TIMESTAMP;');
    console.log('Column hireDate ready.');

    console.log('Adding SYSTEM_ADMIN to Role enum if missing...');
    try {
      await prisma.$executeRawUnsafe('ALTER TYPE "Role" ADD VALUE \'SYSTEM_ADMIN\';');
      console.log('SYSTEM_ADMIN added to Role enum.');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('SYSTEM_ADMIN already exists in Role enum.');
      } else {
        console.error('Failed to add SYSTEM_ADMIN to Role:', e.message);
      }
    }

    console.log('Ensuring corporationId is nullable...');
    await prisma.$executeRawUnsafe('ALTER TABLE "User" ALTER COLUMN "corporationId" DROP NOT NULL;');
    console.log('corporationId is now nullable.');
  } catch (e) {
    console.error('Operation failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
