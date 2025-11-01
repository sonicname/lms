import { betterAuth, BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin as adminPlugin, defaultStatements } from 'better-auth/plugins';
import { createAccessControl } from 'better-auth/plugins/access';
import { PrismaClient } from '../generated/prisma/client';

const defaultAccessControl = {
  ...defaultStatements,
  users: ['create', 'read', 'update', 'delete', 'ban', 'unban'],
  assets: ['create', 'read', 'update', 'delete'],
} as const;

const ac = createAccessControl({
  ...defaultAccessControl,
});

const admin = ac.newRole({
  users: ['create', 'read', 'update', 'delete', 'ban', 'unban'],
  assets: ['create', 'read', 'update', 'delete'],
});

const teacher = ac.newRole({
  users: ['read'],
  assets: ['create', 'read', 'update', 'delete'],
});

const student = ac.newRole({
  users: ['read'],
  assets: ['read'],
});

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
  plugins: [
    adminPlugin({
      ac,
      roles: {
        admin,
        teacher,
        student,
      },
    }),
  ],
} satisfies BetterAuthOptions;

export const auth = betterAuth(authConfig);
