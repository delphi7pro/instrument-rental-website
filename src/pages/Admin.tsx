import { useState, useEffect } from 'react';
import { AdminSidebar, AdminLayout } from '@/components/AdminSidebar';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { RecentOrders } from '@/components/admin/RecentOrders';
import { LowStockAlert } from '@/components/admin/LowStockAlert';
import { QuickActions } from '@/components/admin/QuickActions';
import { ThemeProvider, useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { api, Order, Tool } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const AdminPanelContent = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { isDarkMode, toggleTheme } = useTheme();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const loadDashboardData = async () => {
      try {
        const [ordersResponse, toolsResponse] = await Promise.all([
          api.getOrders({ limit: 5 }),
          api.getTools({ limit: 20 })
        ]);
        
        setOrders(ordersResponse.data.orders);
        setTools(toolsResponse.data.tools);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAdmin, navigate]);

  const stats = [
    {
      title: 'Общая выручка',
      value: `₽${orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}`,
      change: '+12.5%',
      icon: 'TrendingUp',
      color: 'text-green-600'
    },
    {
      title: 'Активные заказы',
      value: orders.filter(o => o.status === 'active').length.toString(),
      change: '+8.2%',
      icon: 'ShoppingCart',
      color: 'text-blue-600'
    },
    {
      title: 'Инструменты в аренде',
      value: tools.filter(t => t.status === 'rented').length.toString(),
      change: '+15.3%',
      icon: 'Wrench',
      color: 'text-orange-600'
    },
    {
      title: 'Новые клиенты',
      value: '89',
      change: '+22.1%',
      icon: 'Users',
      color: 'text-purple-600'
    }
  ];

  const quickActions = [
    {
      title: 'Добавить инструмент',
      icon: 'Plus',
      onClick: () => setActiveSection('tools')
    },
    {
      title: 'Новый заказ',
      icon: 'FileText',
      onClick: () => setActiveSection('orders')
    },
    {
      title: 'Клиенты',
      icon: 'Users',
      onClick: () => setActiveSection('customers')
    },
    {
      title: 'Настройки',
      icon: 'Settings',
      onClick: () => setActiveSection('settings')
    }
  ];

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrders 
          orders={orders} 
          onViewAll={() => setActiveSection('orders')} 
        />
        <LowStockAlert 
          tools={tools} 
          onManageStock={() => setActiveSection('tools')} 
        />
      </div>

      <QuickActions actions={quickActions} />
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'tools':
        return (
          <div className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Переходим к полнофункциональному управлению инструментами</p>
            <Button onClick={() => navigate('/admin/tools')}>
              Открыть управление инструментами
            </Button>
          </div>
        );
      case 'orders':
        return (
          <div className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Переходим к управлению заказами</p>
            <Button onClick={() => navigate('/admin/orders')}>
              Открыть управление заказами
            </Button>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Переходим к детальной аналитике</p>
            <Button onClick={() => navigate('/admin/analytics')}>
              Открыть аналитику
            </Button>
          </div>
        );
      case 'customers':
        return (
          <div className="p-6">
            <p className="text-muted-foreground">Раздел в разработке...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <p className="text-muted-foreground">Настройки в разработке...</p>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Загрузка...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isDarkMode={isDarkMode}
        onThemeToggle={toggleTheme}
      />
      <div className="flex-1">
        {renderContent()}
      </div>
    </AdminLayout>
  );
};

const AdminPanel = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="admin-theme">
      <AdminPanelContent />
    </ThemeProvider>
  );
};

export default AdminPanel;