import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/storage/database/user';
import { getUserPassword } from '@/lib/db-operations';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 简单的会话token生成
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 验证必填字段
    if (!email || !password) {
      return NextResponse.json(
        { error: '请填写邮箱和密码' },
        { status: 400 }
      );
    }

    // 验证用户 - 先尝试 Supabase 方式
    let user = null;
    try {
      user = await verifyPassword(email, password);
    } catch (supabaseError) {
      console.log('Supabase 验证失败，切换到 Drizzle ORM:', supabaseError);
    }

    // 如果 Supabase 验证失败，尝试 Drizzle ORM 方式
    if (!user) {
      try {
        const userWithPassword = await getUserPassword(email);
        if (userWithPassword) {
          const isValid = await bcrypt.compare(password, userWithPassword.password);
          if (isValid) {
            // 从 Drizzle 获取完整用户信息
            const { getUserById } = await import('@/lib/db-operations');
            const drizzleUser = await getUserById(userWithPassword.id);
            if (drizzleUser) {
              user = {
                id: drizzleUser.id,
                username: drizzleUser.username,
                email: drizzleUser.email,
                created_at: drizzleUser.created_at.toISOString(),
              };
            }
          }
        }
      } catch (drizzleError) {
        console.error('Drizzle 验证失败:', drizzleError);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 生成简单的会话token
    const token = generateToken();

    // 在实际生产环境中，这里应该使用更安全的会话管理
    // 如JWT、Redis存储会话等
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
    });

    // 存储用户信息到cookie（加密更好，这里简化处理）
    cookieStore.set('user_id', String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
