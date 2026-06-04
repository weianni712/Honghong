import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// 加载 .env.local 文件
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

export default defineConfig({
  schema: './src/storage/database/shared/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
  verbose: true,
  strict: true,
});
