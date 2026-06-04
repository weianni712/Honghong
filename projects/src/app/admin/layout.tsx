'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/admin', label: '概览', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/admin/users', label: '用户管理', icon: <Users className="w-5 h-5" /> },
  { href: '/admin/orders', label: '订单管理', icon: <ShoppingCart className="w-5 h-5" /> },
];

/**
 * TODO: 管理员权限检查
 * 当前使用简单的客户端检查，建议后续完善：
 * 1. 服务端渲染时检查权限
 * 2. 使用更完善的 RBAC 系统
 * 3. 添加权限缓存
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // TODO: 完善管理员权限检查
    // 当前仅检查 is_admin 字段，建议后续使用更完善的权限系统
    if (!isLoading && user) {
      // 临时方案：检查用户是否有管理员权限
      // 实际项目中应该从服务端获取权限信息
      const checkAdmin = async () => {
        try {
          const response = await fetch('/api/admin/stats');
          if (response.status === 403) {
            setIsAdmin(false);
            router.push('/');
          } else {
            setIsAdmin(true);
          }
        } catch {
          setIsAdmin(false);
          router.push('/');
        }
      };
      checkAdmin();
    } else if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端菜单按钮 */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* 侧边栏 */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/admin" className="text-xl font-bold text-gray-900">
            管理后台
          </Link>
        </div>

        {/* 导航 */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* 底部信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p className="font-medium">{user.username}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                logout();
                router.push('/login');
              }}
            >
              <LogOut className="w-5 h-5 text-gray-500" />
            </Button>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main
        className={`transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-64' : ''
        }`}
      >
        {/* 顶部栏 */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
          <h1 className="text-lg font-semibold text-gray-900">管理后台</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              返回前台
            </Link>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="p-6 lg:p-8">{children}</div>
      </main>

      {/* 移动端遮罩 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
