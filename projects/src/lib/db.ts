import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/storage/database/shared/schema';

// 创建 PostgreSQL 连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// 创建 Drizzle 客户端
export const db = drizzle(pool, { schema });

// 导出 schema 供使用
export * from '@/storage/database/shared/schema';

// 健康检查函数
export async function checkDatabaseHealth() {
  try {
    const result = await pool.query('SELECT NOW()');
    return { healthy: true, timestamp: result.rows[0].now };
  } catch (error) {
    return { healthy: false, error: (error as Error).message };
  }
}
