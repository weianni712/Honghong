import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserById, getUserList, updateUserStatus } from '@/lib/db-operations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 验证管理员权限
 * TODO: 当前使用简单的 is_admin 字段检查，建议后续完善 RBAC 权限系统
 */
async function verifyAdmin() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;

  if (!userId) {
    return { success: false, error: '未登录', status: 401 };
  }

  const user = await getUserById(parseInt(userId));

  if (!user) {
    return { success: false, error: '用户不存在', status: 404 };
  }

  // TODO: 完善管理员权限检查
  if (user.is_admin !== 'true') {
    return { success: false, error: '无权访问', status: 403 };
  }

  return { success: true, user };
}

/**
 * GET /api/admin/users
 * 获取用户列表
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const result = await getUserList({
      search,
      status,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users
 * 更新用户状态
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (!['active', 'inactive', 'banned'].includes(status)) {
      return NextResponse.json(
        { error: '无效的状态值' },
        { status: 400 }
      );
    }

    await updateUserStatus(id, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新用户状态错误:', error);
    return NextResponse.json(
      { error: '更新用户状态失败' },
      { status: 500 }
    );
  }
}
