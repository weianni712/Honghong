import { NextRequest, NextResponse } from 'next/server';
import { createUser as createUserSupabase, hashPassword } from '@/storage/database/user';
import { createUser as createUserDrizzle } from '@/lib/db-operations';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // 验证必填字段
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6位' },
        { status: 400 }
      );
    }

    // 验证用户名长度
    if (username.length < 2 || username.length > 20) {
      return NextResponse.json(
        { error: '用户名长度应在2-20个字符之间' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 尝试使用 Supabase 创建用户
    let user = null;
    try {
      user = await createUserSupabase({
        username,
        email,
        password: hashedPassword,
      });
    } catch (supabaseError) {
      console.log('Supabase 创建用户失败，切换到 Drizzle ORM:', supabaseError);
    }

    // 如果 Supabase 失败，使用 Drizzle ORM
    if (!user) {
      try {
        const drizzleUser = await createUserDrizzle({
          username,
          email,
          password: hashedPassword,
        });
        user = {
          id: drizzleUser.id,
          username: drizzleUser.username,
          email: drizzleUser.email,
          created_at: drizzleUser.created_at.toISOString(),
        };
      } catch (drizzleError) {
        console.error('Drizzle 创建用户失败:', drizzleError);
        throw drizzleError;
      }
    }

    // 返回用户信息（不包含密码）
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
    console.error('注册错误:', error);
    const message = error instanceof Error ? error.message : '注册失败';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
