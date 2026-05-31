'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, BookOpen, Heart, Loader2, Plus } from 'lucide-react';
import { BlogPost } from '@/storage/database/blog';

const categories = ['全部', '情感急救', '沟通技巧', '关系维护'];

export default function BlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const url = selectedCategory === '全部' 
          ? '/api/blog' 
          : `/api/blog?category=${encodeURIComponent(selectedCategory)}`;
        const response = await fetch(url);
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, [selectedCategory]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="flex items-center gap-3 px-4 h-14">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            <h1 className="font-semibold">恋爱攻略</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/blog/generate">
              <Button variant="outline" size="sm" className="text-pink-600 border-pink-200 hover:bg-pink-50">
                <Plus className="mr-1 h-4 w-4" />
                AI生成
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'bg-pink-500 hover:bg-pink-600' : ''}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* 文章列表 */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <Card className="p-5 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                  <div className="flex gap-4">
                    {/* 封面 */}
                    <div className="hidden sm:flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 text-4xl">
                      {post.cover_image || '📝'}
                    </div>
                    
                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700 hover:bg-pink-200">
                          {post.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{post.publish_date}</span>
                      </div>
                      
                      <h2 className="text-lg font-semibold mb-2 line-clamp-1 hover:text-pink-600 transition-colors">
                        {post.title}
                      </h2>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {post.summary}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.read_time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>阅读文章</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {posts.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            <p>该分类下暂无文章</p>
          </div>
        )}

        {/* 提示 */}
        <Card className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            💡 小提示
          </h3>
          <p className="text-sm text-muted-foreground">
            学会沟通技巧后，来这里练习一下吧！理论知识+实践练习，效果更好哦~
          </p>
          <Link href="/">
            <Button variant="link" className="text-pink-600 p-0 h-auto mt-2">
              前往场景练习 →
            </Button>
          </Link>
        </Card>
      </main>
    </div>
  );
}
