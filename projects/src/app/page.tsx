"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { scenarios, categoryLabels, categoryIcons, getDailyScenario } from "@/lib/scenarios";
import { Scenario } from "@/lib/types";
import { apiGet } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { SectionLoader } from "@/components/loading-spinner";
import { toast } from "sonner";

import {
    Flame,
    Star,
    Trophy,
    Calendar,
    TrendingUp,
    Heart,
    BookOpen,
    Loader2,
    User,
    LogOut,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";

interface BlogPost {
    id: number;
    title: string;
    summary: string;
    cover_image?: string;
}

const categories = ["all", "romance", "work", "family", "friend", "client"] as const;

type Category = typeof categories[number];

const difficultyConfig = {
    easy: { color: "bg-green-100 text-green-800", label: "简单" },
    medium: { color: "bg-yellow-100 text-yellow-800", label: "中等" },
    hard: { color: "bg-red-100 text-red-800", label: "困难" },
} as const;

const getDifficultyStyle = (difficulty: string) => {
    return difficultyConfig[difficulty as keyof typeof difficultyConfig] || { 
        color: "bg-gray-100 text-gray-800", 
        label: difficulty 
    };
};

export default function Home() {
    const { user, isLoading: authLoading, logout } = useAuth();

    const [dailyChallenge, setDailyChallenge] = useState<Scenario | null>(null);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [mounted, setMounted] = useState(false);

    // 获取博客文章
    const fetchBlogPosts = useCallback(async () => {
        setIsLoadingPosts(true);
        const { data, error } = await apiGet<BlogPost[]>("/api/blog");
        
        if (error) {
            toast.error("加载文章失败", { description: error });
            console.error("Failed to fetch blog posts:", error);
        } else if (data) {
            setBlogPosts(data);
        }
        
        setIsLoadingPosts(false);
    }, []);

    useEffect(() => {
        setMounted(true);
        setDailyChallenge(getDailyScenario());
        fetchBlogPosts();
    }, [fetchBlogPosts]);

    const handleLogout = useCallback(async () => {
        try {
            await logout();
            toast.success("已退出登录");
        } catch {
            toast.error("退出失败");
        }
    }, [logout]);

    const getCategoryScenarios = useCallback((category: Category) => {
        if (category === "all") return scenarios;
        return scenarios.filter(s => s.category === category);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">💕</span>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                            哄哄你
                        </h1>
                    </div>
                    <nav className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/blog">
                                <BookOpen className="mr-1 h-4 w-4" />
                                恋爱攻略
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/achievements">
                                <Trophy className="mr-1 h-4 w-4" />
                                成就
                            </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/growth">
                                <TrendingUp className="mr-1 h-4 w-4" />
                                成长
                            </Link>
                        </Button>
                        
                        {authLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
                        ) : user ? (
                            <div className="flex items-center gap-2 ml-2">
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>{user.username}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 ml-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/login">登录</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/register">注册</Link>
                                </Button>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Daily Challenge */}
                {dailyChallenge && (
                    <section className="mb-8">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white shadow-lg">
                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
                            <div className="absolute -right-2 top-8 h-16 w-16 rounded-full bg-white/5" />
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="h-5 w-5" />
                                    <span className="text-sm font-medium opacity-90">每日挑战</span>
                                </div>
                                <h2 className="mb-1 text-2xl font-bold">{dailyChallenge.title}</h2>
                                <p className="mb-4 text-sm opacity-90">{dailyChallenge.description}</p>
                                <div className="flex items-center gap-3">
                                    <Link href={`/chat/${dailyChallenge.id}`}>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="bg-white text-orange-600 hover:bg-white/90"
                                        >
                                            <Flame className="mr-1 h-4 w-4" />
                                            开始挑战
                                        </Button>
                                    </Link>
                                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                        {categoryIcons[dailyChallenge.category]} {categoryLabels[dailyChallenge.category]}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Scenario Selection */}
                <section>
                    <h2 className="mb-4 text-xl font-semibold">选择场景</h2>
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="mb-4 flex flex-wrap h-auto gap-1 bg-transparent">
                            {categories.map(cat => (
                                <TabsTrigger
                                    key={cat}
                                    value={cat}
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                >
                                    {cat === "all" ? "全部" : `${categoryIcons[cat]} ${categoryLabels[cat]}`}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        
                        {categories.map(cat => (
                            <TabsContent key={cat} value={cat} className="mt-0">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {getCategoryScenarios(cat).map(scenario => {
                                        const difficulty = getDifficultyStyle(scenario.difficulty);
                                        return (
                                            <Dialog key={scenario.id}>
                                                <DialogTrigger asChild>
                                                    <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 p-4">
                                                        <div className="mb-2 flex items-start justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-2xl">{categoryIcons[scenario.category]}</span>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {categoryLabels[scenario.category]}
                                                                </Badge>
                                                            </div>
                                                            <Badge className={`text-xs ${difficulty.color}`}>
                                                                {difficulty.label}
                                                            </Badge>
                                                        </div>
                                                        <h3 className="mb-1 font-semibold">{scenario.title}</h3>
                                                        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                                                            {scenario.description}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>👤 {scenario.character.name}</span>
                                                            <span>•</span>
                                                            <span>{scenario.character.role}</span>
                                                        </div>
                                                    </Card>
                                                </DialogTrigger>
                                                
                                                <DialogContent className="sm:max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-2">
                                                            <span className="text-2xl">{categoryIcons[scenario.category]}</span>
                                                            {scenario.title}
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <h4 className="mb-2 text-sm font-medium">场景描述</h4>
                                                            <p className="text-sm text-muted-foreground">{scenario.description}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="mb-2 text-sm font-medium">对方信息</h4>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white text-lg font-bold">
                                                                    {scenario.character.name[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{scenario.character.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{scenario.character.role}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="mb-2 text-sm font-medium">初始状态</h4>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span>愤怒值</span>
                                                                    <span className="font-medium text-red-500">{scenario.initialAnger}%</span>
                                                                </div>
                                                                <Progress value={scenario.initialAnger} className="h-2" />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {scenario.tags.map(tag => (
                                                                <Badge key={tag} variant="outline" className="text-xs">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <Link href={`/chat/${scenario.id}`} className="block">
                                                            <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                                                                <Star className="mr-1 h-4 w-4" />
                                                                开始练习
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        );
                                    })}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </section>

                {/* Tips Section */}
                <section className="mt-12">
                    <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">💡 沟通小技巧</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {[
                                "先表达理解和共情，让对方感受到被重视",
                                "真诚道歉，不要找借口或推卸责任",
                                "提供具体的解决方案，而不只是口头承诺",
                                "保持耐心，给对方情绪恢复的时间",
                            ].map((tip, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-green-500">✓</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Blog Section */}
                <section className="mt-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">恋爱攻略</h2>
                        <Link href="/blog">
                            <Button variant="link" className="text-pink-600">查看全部</Button>
                        </Link>
                    </div>
                    
                    {isLoadingPosts ? (
                        <SectionLoader />
                    ) : blogPosts.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {blogPosts.slice(0, 3).map(article => (
                                <Link key={article.id} href={`/blog/${article.id}`}>
                                    <Card className="p-4 h-full transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer">
                                        <div className="text-3xl mb-2">{article.cover_image || "📝"}</div>
                                        <h3 className="font-medium mb-1 line-clamp-1">{article.title}</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{article.summary}</p>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            暂无文章
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
