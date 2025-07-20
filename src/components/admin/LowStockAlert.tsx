import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { Tool } from '@/lib/api';

interface LowStockAlertProps {
  tools: Tool[];
  onManageStock: () => void;
}

export const LowStockAlert = ({ tools, onManageStock }: LowStockAlertProps) => {
  const getLowStockTools = () => {
    return tools
      .filter(tool => tool.inStock <= 2)
      .map(tool => ({
        name: tool.name,
        stock: tool.inStock,
        critical: tool.inStock === 0
      }));
  };

  const lowStockTools = getLowStockTools();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon name="AlertTriangle" size={20} className="mr-2 text-orange-600" />
          Низкие запасы
        </CardTitle>
        <CardDescription>
          Инструменты с низким количеством на складе
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockTools.slice(0, 4).map((tool, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{tool.name}</p>
                <p className="text-xs text-muted-foreground">На складе: {tool.stock} шт.</p>
              </div>
              <Badge 
                variant={tool.critical ? "destructive" : "secondary"}
                className="text-xs"
              >
                {tool.critical ? 'Критично' : 'Низкий'}
              </Badge>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <Button variant="outline" className="w-full" onClick={onManageStock}>
          <Icon name="Package" size={16} className="mr-2" />
          Управление складом
        </Button>
      </CardContent>
    </Card>
  );
};