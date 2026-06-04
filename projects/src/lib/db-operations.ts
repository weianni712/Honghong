import { eq, like, and, desc, count, sql } from 'drizzle-orm';
import { db, users, blogPosts, orders } from './db';

// ==================== 用户操作 ====================

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  status: 'active' | 'inactive' | 'banned';
  is_admin: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserListItem {
  id: number;
  username: string;
  email: string;
  status: 'active' | 'inactive' | 'banned';
  created_at: Date;
}

/**
 * 创建新用户
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  try {
    const [user] = await db
      .insert(users)
      .values({
        username: input.username,
        email: input.email,
        password: input.password,
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        status: users.status,
        is_admin: users.is_admin,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });
    
    return user;
  } catch (error) {
    // 处理唯一约束冲突
    if ((error as Error).message?.includes('unique')) {
      throw new Error('邮箱已被注册');
    }
    throw new Error(`创建用户失败: ${(error as Error).message}`);
  }
}

/**
 * 根据邮箱查找用户
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      status: users.status,
      is_admin: users.is_admin,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return user || null;
}

/**
 * 根据 ID 查找用户
 */
export async function getUserById(id: number): Promise<User | null> {
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      status: users.status,
      is_admin: users.is_admin,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  
  return user || null;
}

/**
 * 获取用户密码（用于登录验证）
 */
export async function getUserPassword(email: string): Promise<{ id: number; password: string } | null> {
  const [user] = await db
    .select({
      id: users.id,
      password: users.password,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return user || null;
}

/**
 * 获取用户列表（支持搜索和筛选）
 */
export async function getUserList(params: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ list: UserListItem[]; total: number }> {
  const { search, status, page = 1, pageSize = 10 } = params;
  
  const conditions = [];
  
  if (search) {
    conditions.push(
      sql`${users.username} LIKE ${`%${search}%`} OR ${users.email} LIKE ${`%${search}%`}`
    );
  }
  
  if (status) {
    conditions.push(eq(users.status, status as 'active' | 'inactive' | 'banned'));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  // 获取总数
  const [countResult] = await db
    .select({ count: count() })
    .from(users)
    .where(whereClause);
  
  // 获取列表
  const list = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      status: users.status,
      created_at: users.created_at,
    })
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.created_at))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  
  return {
    list,
    total: countResult?.count || 0,
  };
}

/**
 * 更新用户状态
 */
export async function updateUserStatus(
  id: number, 
  status: 'active' | 'inactive' | 'banned'
): Promise<void> {
  await db
    .update(users)
    .set({ status, updated_at: new Date() })
    .where(eq(users.id, id));
}

/**
 * 获取用户统计
 */
export async function getUserStats(): Promise<{
  total: number;
  recent: number;
  active: number;
  inactive: number;
  banned: number;
}> {
  const [totalResult] = await db.select({ count: count() }).from(users);
  
  const [recentResult] = await db
    .select({ count: count() })
    .from(users)
    .where(sql`${users.created_at} > NOW() - INTERVAL '7 days'`);
  
  const [activeResult] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.status, 'active'));
  
  const [inactiveResult] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.status, 'inactive'));
  
  const [bannedResult] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.status, 'banned'));
  
  return {
    total: totalResult?.count || 0,
    recent: recentResult?.count || 0,
    active: activeResult?.count || 0,
    inactive: inactiveResult?.count || 0,
    banned: bannedResult?.count || 0,
  };
}

// ==================== 订单操作 ====================

export interface Order {
  id: number;
  user_id: number;
  amount: string;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  remark: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderWithUser extends Order {
  user: {
    id: number;
    username: string;
    email: string;
  } | null;
}

export interface CreateOrderInput {
  user_id: number;
  amount: string;
  remark?: string;
}

/**
 * 获取订单列表（支持搜索和筛选）
 */
export async function getOrderList(params: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ list: OrderWithUser[]; total: number }> {
  const { search, status, page = 1, pageSize = 10 } = params;
  
  const conditions = [];
  
  if (status) {
    conditions.push(eq(orders.status, status as Order['status']));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  // 获取总数
  const [countResult] = await db
    .select({ count: count() })
    .from(orders)
    .where(whereClause);
  
  // 获取列表（关联用户）
  const list = await db
    .select({
      order: {
        id: orders.id,
        user_id: orders.user_id,
        amount: orders.amount,
        status: orders.status,
        remark: orders.remark,
        created_at: orders.created_at,
        updated_at: orders.updated_at,
      },
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
      },
    })
    .from(orders)
    .leftJoin(users, eq(orders.user_id, users.id))
    .where(whereClause)
    .orderBy(desc(orders.created_at))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  
  // 转换格式
  const formattedList: OrderWithUser[] = list.map(item => ({
    ...item.order,
    user: item.user,
  }));
  
  return {
    list: formattedList,
    total: countResult?.count || 0,
  };
}

/**
 * 根据 ID 获取订单详情
 */
export async function getOrderById(id: number): Promise<OrderWithUser | null> {
  const [result] = await db
    .select({
      order: {
        id: orders.id,
        user_id: orders.user_id,
        amount: orders.amount,
        status: orders.status,
        remark: orders.remark,
        created_at: orders.created_at,
        updated_at: orders.updated_at,
      },
      user: {
        id: users.id,
        username: users.username,
        email: users.email,
      },
    })
    .from(orders)
    .leftJoin(users, eq(orders.user_id, users.id))
    .where(eq(orders.id, id))
    .limit(1);
  
  if (!result) return null;
  
  return {
    ...result.order,
    user: result.user,
  };
}

/**
 * 更新订单状态
 */
export async function updateOrderStatus(
  id: number,
  status: Order['status']
): Promise<void> {
  await db
    .update(orders)
    .set({ status, updated_at: new Date() })
    .where(eq(orders.id, id));
}

/**
 * 获取订单统计
 */
export async function getOrderStats(): Promise<{
  total: number;
  recent: number;
  totalAmount: string;
  recentAmount: string;
  pending: number;
  paid: number;
  completed: number;
}> {
  const [totalResult] = await db.select({ count: count() }).from(orders);
  
  const [recentResult] = await db
    .select({ count: count() })
    .from(orders)
    .where(sql`${orders.created_at} > NOW() - INTERVAL '7 days'`);
  
  const [totalAmountResult] = await db
    .select({ sum: sql<string>`COALESCE(SUM(${orders.amount}), 0)` })
    .from(orders);
  
  const [recentAmountResult] = await db
    .select({ sum: sql<string>`COALESCE(SUM(${orders.amount}), 0)` })
    .from(orders)
    .where(sql`${orders.created_at} > NOW() - INTERVAL '7 days'`);
  
  const [pendingResult] = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.status, 'pending'));
  
  const [paidResult] = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.status, 'paid'));
  
  const [completedResult] = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.status, 'completed'));
  
  return {
    total: totalResult?.count || 0,
    recent: recentResult?.count || 0,
    totalAmount: totalAmountResult?.sum || '0',
    recentAmount: recentAmountResult?.sum || '0',
    pending: pendingResult?.count || 0,
    paid: paidResult?.count || 0,
    completed: completedResult?.count || 0,
  };
}

// ==================== 博客操作 ====================

export interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string;
  read_time: string;
  publish_date: Date;
  created_at: Date;
}

export interface CreateBlogPostInput {
  title: string;
  summary: string;
  content: string;
  cover_image?: string;
  category?: string;
  tags?: string;
  read_time?: string;
}

/**
 * 获取所有博客文章
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  return await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      summary: blogPosts.summary,
      content: blogPosts.content,
      cover_image: blogPosts.cover_image,
      category: blogPosts.category,
      tags: blogPosts.tags,
      read_time: blogPosts.read_time,
      publish_date: blogPosts.publish_date,
      created_at: blogPosts.created_at,
    })
    .from(blogPosts)
    .orderBy(blogPosts.publish_date);
}

/**
 * 根据 ID 获取博客文章
 */
export async function getPostById(id: number): Promise<BlogPost | null> {
  const [post] = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      summary: blogPosts.summary,
      content: blogPosts.content,
      cover_image: blogPosts.cover_image,
      category: blogPosts.category,
      tags: blogPosts.tags,
      read_time: blogPosts.read_time,
      publish_date: blogPosts.publish_date,
      created_at: blogPosts.created_at,
    })
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  
  return post || null;
}

/**
 * 根据分类获取博客文章
 */
export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  return await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      summary: blogPosts.summary,
      content: blogPosts.content,
      cover_image: blogPosts.cover_image,
      category: blogPosts.category,
      tags: blogPosts.tags,
      read_time: blogPosts.read_time,
      publish_date: blogPosts.publish_date,
      created_at: blogPosts.created_at,
    })
    .from(blogPosts)
    .where(eq(blogPosts.category, category))
    .orderBy(blogPosts.publish_date);
}

/**
 * 创建博客文章
 */
export async function createPost(input: CreateBlogPostInput): Promise<BlogPost> {
  const [post] = await db
    .insert(blogPosts)
    .values({
      title: input.title,
      summary: input.summary,
      content: input.content,
      cover_image: input.cover_image || '📝',
      category: input.category || '沟通技巧',
      tags: input.tags || '',
      read_time: input.read_time || '5分钟',
    })
    .returning({
      id: blogPosts.id,
      title: blogPosts.title,
      summary: blogPosts.summary,
      content: blogPosts.content,
      cover_image: blogPosts.cover_image,
      category: blogPosts.category,
      tags: blogPosts.tags,
      read_time: blogPosts.read_time,
      publish_date: blogPosts.publish_date,
      created_at: blogPosts.created_at,
    });
  
  return post;
}
