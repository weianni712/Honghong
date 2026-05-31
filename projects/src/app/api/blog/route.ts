import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, getPostsByCategory } from '@/storage/database/blog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let posts;
    if (category) {
      posts = await getPostsByCategory(category);
    } else {
      posts = await getAllPosts();
    }
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json([], { status: 200 });
  }
}
