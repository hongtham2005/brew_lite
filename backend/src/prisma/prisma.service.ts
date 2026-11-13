// [TV1] Task 1
// TODO: PrismaService
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

config({ path: resolve(__dirname, '../../../.env') });

function createPrismaAdapter() {
  const connectionString =
    process.env.DATABASE_URL ??
    `postgresql://${encodeURIComponent(process.env.POSTGRES_USER ?? 'postgres')}:${encodeURIComponent(process.env.POSTGRES_PASSWORD ?? 'password')}@localhost:5432/${encodeURIComponent(process.env.POSTGRES_DB ?? 'brewlite')}?schema=public`;

  return new PrismaPg({ connectionString });
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ adapter: createPrismaAdapter() });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
