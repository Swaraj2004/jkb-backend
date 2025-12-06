import { PrismaClient } from '@prisma/client';

export const prismaClient = new PrismaClient();

async function checkDbConnection() {
  try {
    await prismaClient.$queryRaw`SELECT 1`;
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database not reachable:', err);
  }
}
// checkDbConnection();
