import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

// Global Prisma instance
declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma = globalThis.__prisma || new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug('Database Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`
    });
  });
}

// Log database errors
prisma.$on('error', (e) => {
  logger.error('Database Error', e);
});

// Log database info
prisma.$on('info', (e) => {
  logger.info('Database Info', e);
});

// Log database warnings
prisma.$on('warn', (e) => {
  logger.warn('Database Warning', e);
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