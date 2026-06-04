'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ChevronLeft, ChevronRight, Edit, Eye } from 'lucide-react';

interface OrderUser {
  id: number;
  username: string;
  email: string;
}

interface Order {
  id: number;
  user_id: number;
  amount: string;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  remark: string;
  created_at: string;
  updated_at: string;
  user: OrderUser | null;
}

interface OrderListResponse {
  list: Order[];
  total: number;
}

const statusMap = {
  pending: { label: '待处理', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: '已支付', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: '已发货', color: 'bg-purple-100 text-purple-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-800' },
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [page, status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());

      const response = await fetch(`/api/admin/orders?${params}`);
      if (!response.ok) {
        throw new Error('获取订单列表失败');
      }
      
      const data: OrderListResponse = await response.json();
      setOrders(data.list);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchOrders();
  };

  const handleUpdateStatus = async () => {
    if (!editingOrder || !newStatus) return;

    try {
      setUpdateLoading(true);
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingOrder.id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('更新订单状态失败');
      }

      // 刷新列表
      await fetchOrders();
      setEditingOrder(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新订单状态失败');
    } finally {
      setUpdateLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">订单管理</h2>
        <p className="text-gray-500 mt-1">管理平台订单</p>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="搜索订单号或用户信息..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="paid">已支付</SelectItem>
                <SelectItem value="shipped">已发货</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 订单列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            订单列表 <span className="text-sm font-normal text-gray-500">(共 {total} 条)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无订单数据
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单号</TableHead>
                    <TableHead>用户</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">#{order.id}</TableCell>
                      <TableCell>
                        {order.user ? (
                          <div>
                            <div className="font-medium">{order.user.username}</div>
                            <div className="text-sm text-gray-500">{order.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">未知用户</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        ¥{parseFloat(order.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusMap[order.status].color}>
                          {statusMap[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {new Date(order.created_at).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingOrder(order);
                              setNewStatus(order.status);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 分页 */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  第 {page} 页，共 {totalPages} 页
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 查看详情弹窗 */}
      <Dialog open={!!viewingOrder} onOpenChange={() => setViewingOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>
              订单 #{viewingOrder?.id}
            </DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">订单号</label>
                  <p className="font-mono">#{viewingOrder.id}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">状态</label>
                  <p>
                    <Badge className={statusMap[viewingOrder.status].color}>
                      {statusMap[viewingOrder.status].label}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">金额</label>
                  <p className="font-medium">¥{parseFloat(viewingOrder.amount).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">用户ID</label>
                  <p className="font-mono">{viewingOrder.user_id}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500">用户信息</label>
                {viewingOrder.user ? (
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{viewingOrder.user.username}</p>
                    <p className="text-sm text-gray-500">{viewingOrder.user.email}</p>
                  </div>
                ) : (
                  <p className="text-gray-400">未知用户</p>
                )}
              </div>

              {viewingOrder.remark && (
                <div>
                  <label className="text-sm text-gray-500">备注</label>
                  <p className="mt-1 text-sm">{viewingOrder.remark}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-500">创建时间</label>
                  <p>{new Date(viewingOrder.created_at).toLocaleString('zh-CN')}</p>
                </div>
                <div>
                  <label className="text-gray-500">更新时间</label>
                  <p>{new Date(viewingOrder.updated_at).toLocaleString('zh-CN')}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewingOrder(null)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑状态弹窗 */}
      <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑订单状态</DialogTitle>
            <DialogDescription>
              修改订单 #{editingOrder?.id} 的状态
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="paid">已支付</SelectItem>
                <SelectItem value="shipped">已发货</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOrder(null)}>
              取消
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updateLoading}>
              {updateLoading ? <Spinner className="w-4 h-4" /> : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
