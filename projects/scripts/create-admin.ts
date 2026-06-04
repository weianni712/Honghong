import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { users } from '../src/storage/database/shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('错误: 未找到 DATABASE_URL 环境变量');
  process.exit(1);
}

// 管理员账号信息
const ADMIN_USER = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'admin123456', // 生产环境请使用更强的密码
};

// 加密密码
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function createAdmin() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const db = drizzle(pool);

  try {
    console.log('正在检查管理员账号是否存在...');

    // 检查是否已存在该邮箱
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, ADMIN_USER.email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('管理员账号已存在，更新为管理员权限...');
      
      // 更新为管理员
      await db
        .update(users)
        .set({ 
          is_admin: 'true',
          status: 'active',
          updated_at: new Date()
        })
        .where(eq(users.email, ADMIN_USER.email));
      
      console.log('✅ 管理员权限已更新');
      console.log(`邮箱: ${ADMIN_USER.email}`);
      console.log('密码: (保持原有密码不变)');
    } else {
      console.log('正在创建管理员账号...');

      // 加密密码
      const hashedPassword = await hashPassword(ADMIN_USER.password);

      // 创建新管理员
      const [newUser] = await db
        .insert(users)
        .values({
          username: ADMIN_USER.username,
          email: ADMIN_USER.email,
          password: hashedPassword,
          is_admin: 'true',
          status: 'active',
        })
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          is_admin: users.is_admin,
        });

      console.log('✅ 管理员账号创建成功！');
      console.log(`ID: ${newUser.id}`);
      console.log(`用户名: ${newUser.username}`);
      console.log(`邮箱: ${newUser.email}`);
      console.log(`管理员: ${newUser.is_admin}`);
      console.log('');
      console.log('登录信息:');
      console.log(`邮箱: ${ADMIN_USER.email}`);
      console.log(`密码: ${ADMIN_USER.password}`);
    }

    console.log('');
    console.log('现在你可以访问 http://localhost:5000/admin 登录管理后台');

  } catch (error) {
    console.error('创建管理员账号失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdmin();
