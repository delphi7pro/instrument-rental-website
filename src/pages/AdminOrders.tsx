import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrdersTable } from '@/components/admin/OrdersTable';
import { OrderDetailsDialog } from '@/components/admin/OrderDetailsDialog';
import { useAuth } from '@/hooks/useAuth';
import { api, Order } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const AdminOrdersManagement = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    loadOrders();
  }, [isAdmin, navigate]);

  const loadOrders = async () => {
    try {
      const response = await api.getOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить заказы',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      toast({
        title: 'Успех',
        description: 'Статус заказа обновлен'
      });
      await loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerInfo.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerInfo.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerInfo.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => o.status === 'active').length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders.reduce((sum, order) => sum + order.total, 0)
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Icon name="Loader2" className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление заказами</h1>
          <p className="text-gray-600">Контроль всех заказов и бронирований</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Icon name="Plus" size={16} className="mr-2" />
          Создать заказ
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Всего заказов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ожидают</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Активные</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{orderStats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Завершённые</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{orderStats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Общая выручка</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₽{orderStats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по номеру заказа, имени клиента или телефону..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">Ожидает</SelectItem>
                <SelectItem value="confirmed">Подтверждён</SelectItem>
                <SelectItem value="active">Активный</SelectItem>
                <SelectItem value="completed">Завершён</SelectItem>
                <SelectItem value="cancelled">Отменён</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список заказов ({filteredOrders.length})</CardTitle>
          <CardDescription>
            Все заказы с возможностью управления статусами
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTable
            orders={filteredOrders}
            onUpdateStatus={handleUpdateStatus}
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

export default AdminOrdersManagement;