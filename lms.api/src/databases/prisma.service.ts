import { Injectable, OnModuleInit } from '@nestjs/common';
import { JsPromise } from '@prisma/client/runtime/library';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async $disconnect(): JsPromise<void> {
    await super.$disconnect();
  }
}
