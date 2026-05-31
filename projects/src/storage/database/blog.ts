import { getSupabaseClient } from '@/storage/database/supabase-client';
import { blogPosts as blogPostsSchema } from './shared/schema';

export interface BlogPost {
  id: number;
  title: string;
  summary: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string;
  read_time: string;
  publish_date: string;
  created_at: string;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('blog_posts')
    .select('*')
    .order('publish_date', { ascending: false });
  
  if (error) throw new Error(`查询失败: ${error.message}`);
  return (data || []) as BlogPost[];
}

export async function getPostById(id: number): Promise<BlogPost | null> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) throw new Error(`查询失败: ${error.message}`);
  return data as BlogPost | null;
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('blog_posts')
    .select('*')
    .eq('category', category)
    .order('publish_date', { ascending: false });
  
  if (error) throw new Error(`查询失败: ${error.message}`);
  return (data || []) as BlogPost[];
}

export async function createPost(post: Omit<BlogPost, 'id' | 'created_at'>): Promise<BlogPost> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('blog_posts')
    .insert(post)
    .select()
    .single();
  
  if (error) throw new Error(`插入失败: ${error.message}`);
  return data as BlogPost;
}
