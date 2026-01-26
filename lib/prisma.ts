// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'], // 開発中はSQLログを表示すると便利です
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;