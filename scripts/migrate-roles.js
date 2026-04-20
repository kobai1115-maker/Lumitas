const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log("Starting role migration...");
  
  // 1. Temporarily convert the role column to text so we can change the enum values
  await prisma.$executeRawUnsafe(`ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE TEXT;`);
  
  // 2. Drop the existing Role enum (if we try to drop it while it's in use, it will fail, but we just changed the column to text)
  await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "Role";`);
  
  // 3. Map the old role names to the new role names
  await prisma.$executeRawUnsafe(`UPDATE "public"."User" SET "role" = 'DEVELOPER' WHERE "role" = 'SYSTEM_ADMIN';`);
  await prisma.$executeRawUnsafe(`UPDATE "public"."User" SET "role" = 'MAIN_ADMIN' WHERE "role" = 'ADMIN';`);
  await prisma.$executeRawUnsafe(`UPDATE "public"."User" SET "role" = 'SUB_ADMIN' WHERE "role" = 'MANAGER';`);
  await prisma.$executeRawUnsafe(`
    UPDATE "public"."User" 
    SET "role" = 'GENERAL' 
    WHERE "role" IN ('STAFF_CAREGIVER', 'STAFF_NURSE', 'STAFF_OFFICE', 'STAFF_SOCIAL_WORKER', 'STAFF_OTHER');
  `);
  
  // Also fix user_tenants if it contains old role values
  await prisma.$executeRawUnsafe(`UPDATE "public"."user_tenants" SET "role" = 'DEVELOPER' WHERE "role" = 'SYSTEM_ADMIN';`);
  await prisma.$executeRawUnsafe(`UPDATE "public"."user_tenants" SET "role" = 'MAIN_ADMIN' WHERE "role" = 'ADMIN';`);
  await prisma.$executeRawUnsafe(`UPDATE "public"."user_tenants" SET "role" = 'SUB_ADMIN' WHERE "role" = 'MANAGER' OR "role" = 'manager';`);
  await prisma.$executeRawUnsafe(`
    UPDATE "public"."user_tenants" 
    SET "role" = 'GENERAL' 
    WHERE "role" IN ('STAFF_CAREGIVER', 'STAFF_NURSE', 'STAFF_OFFICE', 'STAFF_SOCIAL_WORKER', 'STAFF_OTHER', 'employee');
  `);

  console.log("Migration script completed. Now you can run `npx prisma db push`");
}

main().catch(e => {
  console.error("Migration failed:", e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
