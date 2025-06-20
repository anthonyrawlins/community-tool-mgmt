import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Global Prisma instance
declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma = globalThis.__prisma || new PrismaClient({
  log: ['query', 'error', 'info', 'warn'],
});

// Prevent multiple instances in development
if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };