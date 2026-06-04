import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserById } from '@/lib/db-operations';
import { getUserStats, getOrderStats } from '@/lib/db-operations';

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
 * GET /api/admin/stats
 * 获取管理后台统计数据
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

    // 并行获取用户和订单统计
    const [userStats, orderStats] = await Promise.all([
      getUserStats(),
      getOrderStats(),
    ]);

    return NextResponse.json({
      users: userStats,
      orders: orderStats,
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
