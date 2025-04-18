import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// Validate database configuration
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!process.env.DATABASE_PROVIDER) {
  throw new Error('DATABASE_PROVIDER environment variable is required');
}

const validProviders = ['sqlite', 'postgresql', 'postgres'];
if (!validProviders.includes(process.env.DATABASE_PROVIDER)) {
  throw new Error(`DATABASE_PROVIDER must be one of: ${validProviders.join(', ')}`);
}

export const prisma = new PrismaClient();