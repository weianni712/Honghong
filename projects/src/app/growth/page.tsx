'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, Award, Target, Calendar } from 'lucide-react';

interface GrowthRecord {
  date: string;
  score: number;
  scenarioTitle: string;
}

export default function GrowthPage() {
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [stats, setStats] = useState({
    totalScenarios: 0,
    averageScore: 0,
    highestScore: 0,
    totalDays: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 从本地存储获取成长记录
    const storedRecords = localStorage.getItem('growthRecords');
    if (storedRecords) {
      const parsed = JSON.parse(storedRecords);
      setRecords(parsed);
      
      // 计算统计数据
      if (parsed.length > 0) {
        const scores = parsed.map((r: GrowthRecord) => r.score);
        setStats({
          totalScenarios: parsed.length,
          averageScore: Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length),
          highestScore: Math.max(...scores),
          totalDays: new Set(parsed.map((r: GrowthRecord) => r.date)).size,
        });
      }
    } else {
      // 添加一些示例数据
      const sampleRecords: GrowthRecord[] = [
        { date: '2024-01-01', score: 65, scenarioTitle: '加班的代价' },
        { date: '2024-01-02', score: 72, scenarioTitle: '被老板冤枉' },
        { date: '2024-01-03', score: 68, scenarioTitle: '忘记纪念日' },
        { date: '2024-01-05', score: 78, scenarioTitle: '青春期的孩子' },
        { date: '2024-01-07', score: 85, scenarioTitle: '和异性的误会' },
      ];
      setRecords(sampleRecords);
      const scores = sampleRecords.map(r => r.score);
      setStats({
        totalScenarios: sampleRecords.length,
        averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        highestScore: Math.max(...scores),
        totalDays: new Set(sampleRecords.map(r => r.date)).size,
      });
    }
  }, []);

  if (!mounted) {
    return null;
  }

  const chartData = records.map(r => ({
    date: r.date.slice(5), // MM-DD格式
    score: r.score,
  }));

  const trend = records.length >= 2 
    ? records[records.length - 1].score - records[0].score 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="flex items-center gap-3 px-4 h-14">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h1 className="font-semibold">成长轨迹</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{stats.totalScenarios}</div>
            <div className="text-xs text-muted-foreground mt-1">完成场景</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.averageScore}</div>
            <div className="text-xs text-muted-foreground mt-1">平均分数</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{stats.highestScore}</div>
            <div className="text-xs text-muted-foreground mt-1">最高分数</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-amber-600">{stats.totalDays}</div>
            <div className="text-xs text-muted-foreground mt-1">练习天数</div>
          </Card>
        </div>

        {/* 趋势卡片 */}
        <Card className="p-6 bg-gradient-to-r from-green-100 to-emerald-100 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">情商提升趋势</h2>
              <p className="text-sm text-muted-foreground">你的沟通能力在进步</p>
            </div>
            <div className={`text-2xl font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend}分
            </div>
          </div>
          
          {chartData.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <p>开始练习后即可查看趋势图</p>
            </div>
          )}
        </Card>

        {/* 历史记录 */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            历史记录
          </h2>
          {records.length > 0 ? (
            <div className="space-y-3">
              {records.slice().reverse().map((record, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{record.scenarioTitle}</p>
                      <p className="text-sm text-muted-foreground">{record.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{record.score}</div>
                      <div className="text-xs text-muted-foreground">分</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-4xl mb-3">📈</div>
              <p className="text-muted-foreground">还没有练习记录</p>
              <p className="text-sm text-muted-foreground mt-1">
                完成场景练习后，这里会显示你的成长轨迹
              </p>
            </Card>
          )}
        </div>

        {/* 继续练习 */}
        <Link href="/">
          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600">
            <Target className="mr-1 h-4 w-4" />
            继续练习
          </Button>
        </Link>

        {/* 建议 */}
        {records.length > 0 && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-500" />
              成长建议
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 保持每天练习的习惯，循序渐进提升</li>
              <li>• 注意总结复盘，学习不同场景的沟通技巧</li>
              <li>• 将学到的技巧应用到真实生活中</li>
              {stats.averageScore < 60 && (
                <li>• 建议多练习"共情表达"和"真诚道歉"类场景</li>
              )}
              {stats.averageScore >= 60 && stats.averageScore < 80 && (
                <li>• 尝试更高难度的场景，挑战自己</li>
              )}
              {stats.averageScore >= 80 && (
                <li>• 你已经做得很好了！继续保持</li>
              )}
            </ul>
          </Card>
        )}
      </main>
    </div>
  );
}
