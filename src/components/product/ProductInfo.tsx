import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ProductInfoProps {
  name: string;
  brand: string;
  model?: string;
  rating: number;
  reviewCount: number;
  description: string;
  features: string[];
}

export const ProductInfo = ({ 
  name, 
  brand, 
  model, 
  rating, 
  reviewCount, 
  description, 
  features 
}: ProductInfoProps) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{name}</h1>
      <p className="text-gray-600 mb-4">{brand} {model && `· ${model}`}</p>
      
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Icon 
                key={i} 
                name="Star" 
                className={`h-4 w-4 ${
                  i < Math.floor(rating) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium">{rating}</span>
        </div>
        <span className="text-sm text-gray-600">({reviewCount} отзывов)</span>
      </div>

      <p className="text-gray-700 mb-6">{description}</p>

      {/* Key Features */}
      <div className="flex flex-wrap gap-2 mb-6">
        {features.slice(0, 4).map((feature, index) => (
          <Badge key={index} variant="secondary">
            {feature}
          </Badge>
        ))}
      </div>
    </div>
  );
};