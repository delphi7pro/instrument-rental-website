import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tool } from '@/lib/api';

interface ToolCardProps {
  tool: Tool;
  viewMode: 'grid' | 'list';
  onAddToCart: (tool: Tool) => void;
  onClick: (toolId: string) => void;
}

export const ToolCard = ({ tool, viewMode, onAddToCart, onClick }: ToolCardProps) => {
  const isAvailable = tool.status === 'available' && tool.inStock > 0;

  return (
    <Card 
      className={`hover:shadow-lg transition-shadow cursor-pointer ${
        viewMode === 'list' ? 'flex flex-row' : ''
      }`}
      onClick={() => onClick(tool._id)}
    >
      <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
        <img 
          src={tool.images[0] || '/img/5e130715-b755-4ab5-82af-c9e448995766.jpg'} 
          alt={tool.name}
          className={`object-cover ${
            viewMode === 'grid' 
              ? 'w-full h-48 rounded-t-lg' 
              : 'w-full h-full rounded-l-lg'
          }`}
        />
        {!isAvailable && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary">Занято</Badge>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="bg-white">
            {tool.subcategory}
          </Badge>
        </div>
      </div>
      
      <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{tool.name}</h3>
            <p className="text-sm text-gray-600 mb-1">{tool.brand}</p>
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex items-center space-x-1">
                <Icon name="Star" className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{tool.rating}</span>
              </div>
              <span className="text-sm text-gray-400">({tool.reviewCount} отзывов)</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {tool.price}₽
            </div>
            <div className="text-sm text-gray-600">/день</div>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {tool.features.slice(0, 3).map((feature, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Icon name="Zap" className="h-4 w-4" />
              <span>{tool.specifications.power}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Weight" className="h-4 w-4" />
              <span>{tool.specifications.weight}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              В наличии: {tool.inStock}
            </span>
            <Button 
              size="sm" 
              disabled={!isAvailable}
              className="bg-blue-600 hover:bg-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                if (isAvailable) {
                  onAddToCart(tool);
                }
              }}
            >
              {isAvailable ? 'В корзину' : 'Занято'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};