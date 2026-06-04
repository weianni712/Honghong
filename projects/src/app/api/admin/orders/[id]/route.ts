import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserById, getOrderById } from '@/lib/db-operations';

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
 * GET /api/admin/orders/[id]
 * 获取订单详情
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: '无效的订单ID' },
        { status: 400 }
      );
    }

    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('获取订单详情错误:', error);
    return NextResponse.json(
      { error: '获取订单详情失败' },
      { status: 500 }
    );
  }
}
