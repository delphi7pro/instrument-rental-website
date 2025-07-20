import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CatalogFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  showAvailable: boolean;
  onShowAvailableChange: (show: boolean) => void;
  categories: Category[];
  brands: string[];
  onResetFilters: () => void;
}

export const CatalogFilters = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedBrand,
  onBrandChange,
  priceRange,
  onPriceRangeChange,
  showAvailable,
  onShowAvailableChange,
  categories,
  brands,
  onResetFilters
}: CatalogFiltersProps) => {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="text-sm font-medium text-gray-900 mb-2 block">Поиск</label>
        <div className="relative">
          <Input
            placeholder="Найти инструмент..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
          <Icon name="Search" className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="text-sm font-medium text-gray-900 mb-3 block">Категория</label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`cursor-pointer p-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onCategoryChange(category.id)}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm">{category.name}</span>
                <span className="text-xs text-gray-500">{category.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Brand */}
      <div>
        <label className="text-sm font-medium text-gray-900 mb-3 block">Бренд</label>
        <Select value={selectedBrand} onValueChange={onBrandChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium text-gray-900 mb-3 block">
          Цена: {priceRange[0]}₽ - {priceRange[1]}₽
        </label>
        <Slider
          value={priceRange}
          onValueChange={onPriceRangeChange}
          max={3000}
          min={0}
          step={50}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0₽</span>
          <span>3000₽</span>
        </div>
      </div>

      <Separator />

      {/* Availability */}
      <div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="available"
            checked={showAvailable}
            onCheckedChange={onShowAvailableChange}
          />
          <label
            htmlFor="available"
            className="text-sm font-medium text-gray-900 cursor-pointer"
          >
            Только в наличии
          </label>
        </div>
      </div>

      {/* Reset Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={onResetFilters}
      >
        <Icon name="RotateCcw" className="h-4 w-4 mr-2" />
        Сбросить фильтры
      </Button>
    </div>
  );
};