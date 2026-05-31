import { getSupabaseClient } from './supabase-client';

export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  created_at: string;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string; // 加密后的密码
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .insert({
      username: input.username,
      email: input.email,
      password: input.password,
    })
    .select()
    .single();

  if (error) {
    if (error.message.includes('unique')) {
      throw new Error('邮箱已被注册');
    }
    throw new Error(`创建用户失败: ${error.message}`);
  }

  return data as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .select('id, username, email, created_at')
    .eq('email', email)
    .maybeSingle();

  if (error) throw new Error(`查询用户失败: ${error.message}`);
  return data as User | null;
}

export async function getUserById(id: number): Promise<User | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .select('id, username, email, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`查询用户失败: ${error.message}`);
  return data as User | null;
}

export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('users')
    .select('id, username, email, password, created_at')
    .eq('email', email)
    .maybeSingle();

  if (error) throw new Error(`查询用户失败: ${error.message}`);
  if (!data) return null;

  // 使用bcrypt验证密码
  const bcrypt = await import('bcryptjs');
  const isValid = await bcrypt.compare(password, data.password);
  
  if (!isValid) return null;

  // 返回用户信息（不包含密码）
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    created_at: data.created_at,
  };
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 10);
}
