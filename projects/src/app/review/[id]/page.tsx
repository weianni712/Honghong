'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getScenarioById } from '@/lib/scenarios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Home, 
  RefreshCw,
  ThumbsUp,
  Lightbulb,
  Target,
  Trophy,
  Star,
  Copy,
  CheckCheck
} from 'lucide-react';

export default function ReviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const scenarioId = params.id as string;
  const turns = parseInt(searchParams.get('turns') || '5');
  const initialScore = parseInt(searchParams.get('score') || '65');
  
  const [scenario, setScenario] = useState<any>(null);
  const [reviewData, setReviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedSuggestion, setCopiedSuggestion] = useState<number | null>(null);

  useEffect(() => {
    const loadedScenario = getScenarioById(scenarioId);
    setScenario(loadedScenario);
    
    // 调用复盘API
    fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenarioTitle: loadedScenario?.title,
        characterName: loadedScenario?.character.name,
        turns,
      }),
    })
      .then(res => res.json())
      .then(data => {
        setReviewData(data);
        setIsLoading(false);
      })
      .catch(() => {
        setReviewData({
          strengths: ['表达了一定的理解和歉意', '态度比较诚恳', '愿意沟通解决问题'],
          improvements: ['可以更加具体地道歉', '多倾听对方的感受', '避免找借口'],
          suggestions: ['下次遇到类似情况，可以先说"我完全理解你的感受"', '然后具体说明自己哪里做错了', '最后提出具体的改进方案'],
          score: initialScore,
          scoreLevel: initialScore > 70 ? 'high' : initialScore > 40 ? 'medium' : 'low',
        });
        setIsLoading(false);
      });
  }, [scenarioId, turns, initialScore]);

  const copySuggestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSuggestion(index);
    setTimeout(() => setCopiedSuggestion(null), 2000);
  };

  type ScoreLevel = 'low' | 'medium' | 'high';

  const scoreLevelConfig: Record<ScoreLevel, { label: string; color: string; bg: string }> = {
    low: { label: '需要提升', color: 'text-red-500', bg: 'bg-red-100' },
    medium: { label: '还不错', color: 'text-yellow-500', bg: 'bg-yellow-100' },
    high: { label: '情商高手', color: 'text-green-500', bg: 'bg-green-100' },
  };

  const currentLevel: ScoreLevel = (reviewData?.scoreLevel || (initialScore > 70 ? 'high' : initialScore > 40 ? 'medium' : 'low')) as ScoreLevel;

  if (!scenario) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>加载中...</p>
      </div>
    );
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
          <div>
            <h1 className="font-semibold text-sm">复盘总结</h1>
            <p className="text-xs text-muted-foreground">{scenario.title}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* 分数卡片 */}
        <Card className="p-6">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${scoreLevelConfig[currentLevel].bg} ${scoreLevelConfig[currentLevel].color}`}>
              <Trophy className="h-5 w-5" />
              <span className="font-semibold">{scoreLevelConfig[currentLevel].label}</span>
            </div>
            <div className="mt-4">
              <span className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                {reviewData?.score || initialScore}
              </span>
              <span className="text-2xl text-muted-foreground">分</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">综合评分</span>
              <span className="font-medium">{reviewData?.score || initialScore}/100</span>
            </div>
            <Progress value={reviewData?.score || initialScore} className="h-3" />
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{turns}</div>
                <div className="text-xs text-muted-foreground">对话轮数</div>
              </div>
              <div className="text-center p-3 bg-pink-50 rounded-lg">
                <div className="text-2xl font-bold text-pink-600">{scenario.character.name}</div>
                <div className="text-xs text-muted-foreground">对方角色</div>
              </div>
            </div>
          </div>
        </Card>

        {/* 复盘内容 */}
        {isLoading ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">正在分析你的表现...</p>
          </Card>
        ) : (
          <Tabs defaultValue="strengths" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="strengths" className="gap-1">
                <ThumbsUp className="h-4 w-4" />
                做得好的
              </TabsTrigger>
              <TabsTrigger value="improve" className="gap-1">
                <Target className="h-4 w-4" />
                可改进的
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="gap-1">
                <Lightbulb className="h-4 w-4" />
                建议话术
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="strengths" className="mt-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="font-semibold">你的优点</h3>
                </div>
                <ul className="space-y-3">
                  {(reviewData?.strengths || []).map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>
            
            <TabsContent value="improve" className="mt-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <Target className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="font-semibold">可以改进的地方</h3>
                </div>
                <ul className="space-y-3">
                  {(reviewData?.improvements || []).map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>
            
            <TabsContent value="suggestions" className="mt-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">下次可以这么说</h3>
                </div>
                <div className="space-y-3">
                  {(reviewData?.suggestions || []).map((item: string, index: number) => (
                    <div 
                      key={index} 
                      className="p-3 bg-purple-50 rounded-lg relative group"
                    >
                      <p className="text-sm pr-8">{item}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={() => copySuggestion(item, index)}
                      >
                        {copiedSuggestion === index ? (
                          <CheckCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  点击复制话术，下次遇到类似情况可以直接使用
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* 成就提示 */}
        <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏆</div>
            <div>
              <h3 className="font-semibold">成就已解锁</h3>
              <p className="text-sm text-muted-foreground">
                {turns <= 3 ? '三句话哄好' : turns <= 5 ? '五步定乾坤' : '耐心倾听'}
              </p>
            </div>
          </div>
        </Card>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <Link href={`/chat/${scenarioId}`}>
            <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600">
              <RefreshCw className="mr-1 h-4 w-4" />
              再练一次
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              <Home className="mr-1 h-4 w-4" />
              返回首页
            </Button>
          </Link>
        </div>

        {/* 学习建议 */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-blue-500" />
            继续学习
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            尝试其他场景，锻炼不同情境下的沟通能力
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">情侣沟通</Badge>
            <Badge variant="outline">职场关系</Badge>
            <Badge variant="outline">亲子教育</Badge>
            <Badge variant="outline">朋友相处</Badge>
          </div>
        </Card>
      </main>
    </div>
  );
}
