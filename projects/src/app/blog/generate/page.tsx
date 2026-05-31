'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Sparkles, Loader2, CheckCircle, FileText } from 'lucide-react';

const categories = ['沟通技巧', '情感急救', '关系维护', '职场沟通', '亲子教育'];

export default function BlogGeneratePage() {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('沟通技巧');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, category }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '生成失败');
      }
      
      setResult(data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

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
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-500" />
            <h1 className="font-semibold">AI生成文章</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-500" />
            生成新文章
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                文章主题
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="例如：如何优雅地表达不满"
                disabled={isGenerating}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                分类
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={category === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategory(cat)}
                    disabled={isGenerating}
                    className={category === cat ? 'bg-pink-500 hover:bg-pink-600' : ''}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={handleGenerate} 
              disabled={!topic.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  生成文章
                </>
              )}
            </Button>
          </div>
        </Card>

        {error && (
          <Card className="p-4 border-red-200 bg-red-50">
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        )}

        {result && (
          <Card className="p-6 border-green-200 bg-green-50">
            <div className="flex items-center gap-2 mb-4 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">文章生成成功！</span>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="text-3xl mb-2">{result.cover_image || '📝'}</div>
              <h3 className="text-lg font-semibold mb-1">{result.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{result.summary}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>分类: {result.category}</span>
                <span>阅读时间: {result.read_time}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link href={`/blog/${result.id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <FileText className="mr-1 h-4 w-4" />
                  查看文章
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => {
                  setTopic('');
                  setResult(null);
                }}
              >
                继续生成
              </Button>
            </div>
          </Card>
        )}

        {/* 提示 */}
        <Card className="p-4 mt-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-2">💡 提示</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 输入想要生成的文章主题，AI会自动创作完整文章</li>
            <li>• 生成的文章会自动保存到数据库</li>
            <li>• 可以生成多种主题的文章，如：</li>
          </ul>
          <div className="flex flex-wrap gap-2 mt-3">
            {['如何巧妙化解尴尬', '高情商的人都这样做', '伴侣冷战怎么办'].map(suggestion => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => setTopic(suggestion)}
                disabled={isGenerating}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
