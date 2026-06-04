import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// 加载环境变量
dotenv.config({ path: '.env.local' });

// 管理员账号信息
const ADMIN_USER = {
  username: 'admin',
  email: 'admin@example.com',
  password: 'admin123456',
};

// 加密密码
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function createAdmin() {
  // 获取 Supabase 配置
  const supabaseUrl = process.env.COZE_SUPABASE_URL;
  const supabaseKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('错误: 未找到 Supabase 配置');
    console.error('COZE_SUPABASE_URL:', supabaseUrl ? '已设置' : '未设置');
    console.error('COZE_SUPABASE_ANON_KEY:', supabaseKey ? '已设置' : '未设置');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('正在检查管理员账号是否存在...');

    // 检查是否已存在该邮箱
    const { data: existingUser, error: queryError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', ADMIN_USER.email)
      .maybeSingle();

    if (queryError) {
      throw new Error(`查询失败: ${queryError.message}`);
    }

    if (existingUser) {
      console.log('管理员账号已存在，更新为管理员权限...');
      
      // 加密密码
      const hashedPassword = await hashPassword(ADMIN_USER.password);

      // 更新为管理员
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          is_admin: 'true',
          status: 'active',
          password: hashedPassword, // 同时更新密码
        })
        .eq('email', ADMIN_USER.email);

      if (updateError) {
        throw new Error(`更新失败: ${updateError.message}`);
      }
      
      console.log('✅ 管理员权限已更新');
      console.log(`邮箱: ${ADMIN_USER.email}`);
      console.log('密码已重置为: admin123456');
    } else {
      console.log('正在创建管理员账号...');

      // 加密密码
      const hashedPassword = await hashPassword(ADMIN_USER.password);

      // 创建新管理员
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          username: ADMIN_USER.username,
          email: ADMIN_USER.email,
          password: hashedPassword,
          is_admin: 'true',
          status: 'active',
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`创建失败: ${insertError.message}`);
      }

      console.log('✅ 管理员账号创建成功！');
      console.log(`ID: ${newUser.id}`);
      console.log(`用户名: ${newUser.username}`);
      console.log(`邮箱: ${newUser.email}`);
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
  }
}

createAdmin();
