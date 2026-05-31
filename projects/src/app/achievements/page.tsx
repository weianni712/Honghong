'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { achievements } from '@/lib/achievements';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, Lock, Star } from 'lucide-react';

export default function AchievementsPage() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 从本地存储获取已解锁的成就
    const stored = localStorage.getItem('achievements');
    if (stored) {
      setUnlockedAchievements(JSON.parse(stored));
    }
  }, []);

  const isUnlocked = (achievementId: string) => {
    return unlockedAchievements.some((a: any) => a.id === achievementId);
  };

  if (!mounted) {
    return null;
  }

  const unlockedCount = achievements.filter(a => isUnlocked(a.id)).length;
  const progress = (unlockedCount / achievements.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="flex items-center gap-3 px-4 h-14">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h1 className="font-semibold">成就中心</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* 进度卡片 */}
        <Card className="p-6 bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">成就进度</h2>
              <p className="text-sm text-muted-foreground">
                已解锁 {unlockedCount}/{achievements.length} 个成就
              </p>
            </div>
            <div className="text-4xl">
              {unlockedCount === achievements.length ? '🎉' : '💪'}
            </div>
          </div>
          <Progress value={progress} className="h-3" />
          {progress === 100 && (
            <p className="text-sm text-center mt-3 text-amber-700 font-medium">
              太棒了！你已解锁全部成就！
            </p>
          )}
        </Card>

        {/* 成就列表 */}
        <div className="grid gap-4 sm:grid-cols-2">
          {achievements.map(achievement => {
            const unlocked = isUnlocked(achievement.id);
            return (
              <Card 
                key={achievement.id} 
                className={`p-4 transition-all ${
                  unlocked 
                    ? 'bg-white shadow-md' 
                    : 'bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl ${
                    unlocked 
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                      : 'bg-gray-200'
                  }`}>
                    {unlocked ? achievement.icon : <Lock className="h-5 w-5 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${unlocked ? '' : 'text-gray-500'}`}>
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    {unlocked && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <Star className="h-3 w-3" />
                        已解锁
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* 提示 */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-blue-500" />
            如何解锁更多成就
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 尝试在更少的对话轮数内完成任务</li>
            <li>• 练习不同场景，掌握各种沟通技巧</li>
            <li>• 使用幽默、表达共情，展现高情商</li>
            <li>• 在坚守立场的同时也能照顾对方感受</li>
          </ul>
        </Card>
      </main>
    </div>
  );
}
