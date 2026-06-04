'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';

interface StatsData {
  users: {
    total: number;
    recent: number;
    active: number;
    inactive: number;
    banned: number;
  };
  orders: {
    total: number;
    recent: number;
    totalAmount: string;
    recentAmount: string;
    pending: number;
    paid: number;
    completed: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('获取统计数据失败');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert>
        <AlertDescription>暂无数据</AlertDescription>
      </Alert>
    );
  }

  const statCards = [
    {
      title: '用户总数',
      value: stats.users.total.toLocaleString(),
      icon: <Users className="w-5 h-5 text-blue-600" />,
      trend: `+${stats.users.recent} 本周新增`,
      trendUp: true,
    },
    {
      title: '订单总数',
      value: stats.orders.total.toLocaleString(),
      icon: <ShoppingCart className="w-5 h-5 text-green-600" />,
      trend: `+${stats.orders.recent} 本周新增`,
      trendUp: true,
    },
    {
      title: '总成交额',
      value: `¥${parseFloat(stats.orders.totalAmount).toLocaleString()}`,
      icon: <DollarSign className="w-5 h-5 text-yellow-600" />,
      trend: `+¥${parseFloat(stats.orders.recentAmount).toLocaleString()} 本周`,
      trendUp: true,
    },
    {
      title: '活跃用户',
      value: stats.users.active.toLocaleString(),
      icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
      trend: `${((stats.users.active / stats.users.total) * 100).toFixed(1)}% 占比`,
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">概览</h2>
        <p className="text-gray-500 mt-1">查看平台运营数据概览</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <p className={`text-xs mt-1 ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {card.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">用户分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">活跃用户</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${(stats.users.active / stats.users.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {stats.users.active}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">未激活用户</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-400 rounded-full"
                      style={{
                        width: `${(stats.users.inactive / stats.users.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {stats.users.inactive}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">已封禁用户</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{
                        width: `${(stats.users.banned / stats.users.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {stats.users.banned}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 订单统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">订单状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">待处理</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{
                        width: `${(stats.orders.pending / stats.orders.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {stats.orders.pending}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">已支付</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(stats.orders.paid / stats.orders.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {stats.orders.paid}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">已完成</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${(stats.orders.completed / stats.orders.total) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {stats.orders.completed}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
