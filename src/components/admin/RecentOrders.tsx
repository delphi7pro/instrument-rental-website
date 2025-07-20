import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { Order } from '@/lib/api';

interface RecentOrdersProps {
  orders: Order[];
  onViewAll: () => void;
}

export const RecentOrders = ({ orders, onViewAll }: RecentOrdersProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: 'Ожидает', variant: 'secondary' as const },
      confirmed: { text: 'Подтверждён', variant: 'default' as const },
      active: { text: 'Активный', variant: 'default' as const },
      completed: { text: 'Завершён', variant: 'secondary' as const },
      cancelled: { text: 'Отменён', variant: 'destructive' as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дней назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Недавние заказы</CardTitle>
        <CardDescription>
          Последние заказы в системе
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">{order.customerInfo.firstName} {order.customerInfo.lastName}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} инструмент(ов) • {order.items[0]?.toolName}
                      {order.items.length > 1 && ` +${order.items.length - 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">₽{order.total.toLocaleString()}</p>
                <div className="mt-1">
                  {getStatusBadge(order.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <Button variant="outline" className="w-full" onClick={onViewAll}>
          <Icon name="ArrowRight" size={16} className="mr-2" />
          Посмотреть все заказы
        </Button>
      </CardContent>
    </Card>
  );
};