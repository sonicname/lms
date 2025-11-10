export const ProfileSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    firstName: { type: 'string', nullable: true },
    lastName: { type: 'string', nullable: true },
    address: { type: 'string', nullable: true },
    phone: { type: 'string', nullable: true },
    bio: { type: 'string', nullable: true },
    userId: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;
