import { betterAuth, BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

const authConfig = {
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  emailAndPassword: {
    enabled: true,
  },
  account: {
    modelName: 'account',
  },
  user: {
    modelName: 'user',
  },
  session: {
    modelName: 'session',
  },
  verification: {
    modelName: 'verification',
  },
} satisfies BetterAuthOptions;

export const auth = betterAuth(authConfig);
