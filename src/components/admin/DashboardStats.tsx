import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

interface DashboardStatsProps {
  stats: StatCard[];
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <Icon name={stat.icon as any} size={20} className={stat.color} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-green-600 mt-1">
              {stat.change} с прошлого месяца
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};