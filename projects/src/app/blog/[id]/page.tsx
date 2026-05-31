'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Clock, Calendar, Share2, BookOpen, Heart, Loader2 } from 'lucide-react';

export default function BlogDetailPage() {
  const params = useParams();
  const postId = params.id as string;
  const [post, setPost] = useState<any>(null);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 获取所有文章然后找到对应的
        const allPostsResponse = await fetch('/api/blog');
        const allPostsData = await allPostsResponse.json();
        setAllPosts(allPostsData);
        
        // 找到当前文章
        const currentPost = allPostsData.find((p: any) => p.id === parseInt(postId));
        if (currentPost) {
          setPost(currentPost);
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [postId]);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!post || post.error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">文章不存在</p>
          <Link href="/blog">
            <Button>返回攻略列表</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 获取上一篇和下一篇文章
  const currentIndex = allPosts.findIndex(p => p.id === parseInt(postId));
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  // 简单的Markdown渲染
  const renderContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return (
            <h1 key={index} className="text-2xl font-bold mt-8 mb-4 text-gray-900">
              {line.slice(2)}
            </h1>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl font-semibold mt-6 mb-3 text-gray-800">
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={index} className="text-lg font-medium mt-4 mb-2 text-gray-800">
              {line.slice(4)}
            </h3>
          );
        }
        if (line.startsWith('> ')) {
          return (
            <blockquote key={index} className="border-l-4 border-pink-400 pl-4 py-2 my-4 bg-pink-50 italic text-gray-700">
              {line.slice(2)}
            </blockquote>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <li key={index} className="ml-4 list-disc text-gray-700 leading-relaxed">
              {line.slice(2)}
            </li>
          );
        }
        if (line.match(/^✓ /)) {
          return (
            <p key={index} className="text-green-600 font-medium my-2">
              {line}
            </p>
          );
        }
        if (line.match(/^✗ /)) {
          return (
            <p key={index} className="text-red-500 font-medium my-2">
              {line}
            </p>
          );
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        // 处理加粗
        const parts = line.split(/(\*\*[^*]+\*\*)/);
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-3">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      });
  };

  const tags = post.tags ? post.tags.split(',') : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="flex items-center gap-3 px-4 h-14">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/blog">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="font-semibold text-sm truncate">{post.title}</h1>
          </div>
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 文章头部 */}
        <article className="max-w-2xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                {post.category}
              </Badge>
              {tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{post.publish_date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.read_time}</span>
              </div>
            </div>
          </div>

          {/* 文章内容 */}
          <Card className="p-6 sm:p-8 mb-8">
            <div className="prose prose-pink max-w-none">
              {renderContent(post.content)}
            </div>
          </Card>

          {/* 底部导航 */}
          <div className="flex justify-between items-center gap-4">
            {prevPost ? (
              <Link href={`/blog/${prevPost.id}`} className="flex-1">
                <Card className="p-4 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span>上一篇</span>
                  </div>
                  <p className="font-medium line-clamp-1 group-hover:text-pink-600 transition-colors">
                    {prevPost.title}
                  </p>
                </Card>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            
            {nextPost ? (
              <Link href={`/blog/${nextPost.id}`} className="flex-1">
                <Card className="p-4 hover:shadow-md transition-all group text-right">
                  <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-1">
                    <span>下一篇</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="font-medium line-clamp-1 group-hover:text-pink-600 transition-colors">
                    {nextPost.title}
                  </p>
                </Card>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>

          {/* 相关推荐 */}
          <Card className="p-6 mt-8 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-pink-500" />
              实战练习
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              学习了这些沟通技巧，来实际演练一下吧！AI模拟真实场景，帮你把学到的方法用起来。
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                <Heart className="mr-1 h-4 w-4" />
                开始场景练习
              </Button>
            </Link>
          </Card>
        </article>
      </main>
    </div>
  );
}
