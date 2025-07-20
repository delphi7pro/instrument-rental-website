import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface QuickAction {
  title: string;
  icon: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions = ({ actions }: QuickActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Быстрые действия</CardTitle>
        <CardDescription>
          Часто используемые функции администратора
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Button 
              key={index}
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={action.onClick}
            >
              <Icon name={action.icon as any} size={24} />
              <span className="text-sm">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};