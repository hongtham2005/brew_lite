import { config } from 'dotenv';
import { resolve } from 'node:path';
import { defineConfig } from 'prisma/config';

config({ path: resolve(__dirname, '../.env') });

const databaseUrl =
  process.env.DATABASE_URL ??
  `postgresql://${encodeURIComponent(process.env.POSTGRES_USER ?? 'postgres')}:${encodeURIComponent(process.env.POSTGRES_PASSWORD ?? 'password')}@localhost:5432/${encodeURIComponent(process.env.POSTGRES_DB ?? 'brewlite')}?schema=public`;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});
