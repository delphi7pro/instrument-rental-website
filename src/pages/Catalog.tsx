import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ToolCard } from '@/components/catalog/ToolCard';
import { CatalogFilters } from '@/components/catalog/CatalogFilters';
import { useCart } from '@/contexts/CartContext';
import { api, Tool } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function Catalog() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; count: number }>>([]);
  const [brands, setBrands] = useState<string[]>(['Все бренды']);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('Все бренды');
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAvailable, setShowAvailable] = useState(false);

  useEffect(() => {
    loadCatalogData();
  }, []);

  const loadCatalogData = async () => {
    try {
      const [toolsResponse, categoriesResponse] = await Promise.all([
        api.getTools(),
        api.getCategories()
      ]);
      
      const toolsData = toolsResponse.data.tools;
      setTools(toolsData);
      
      // Формируем категории с подсчетом
      const categoriesWithCount = [
        { id: 'all', name: 'Все категории', count: toolsData.length },
        ...categoriesResponse.data.map(cat => ({
          id: cat.name.toLowerCase(),
          name: cat.name,
          count: toolsData.filter(t => t.category === cat.name).length
        }))
      ];
      setCategories(categoriesWithCount);
      
      // Формируем список брендов
      const uniqueBrands = ['Все бренды', ...Array.from(new Set(toolsData.map(t => t.brand)))];
      setBrands(uniqueBrands);
    } catch (error) {
      console.error('Failed to load catalog data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить каталог',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = useMemo(() => {
    let filtered = tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tool.category.toLowerCase() === selectedCategory;
      const matchesBrand = selectedBrand === 'Все бренды' || tool.brand === selectedBrand;
      const matchesPrice = tool.price >= priceRange[0] && tool.price <= priceRange[1];
      const matchesAvailable = !showAvailable || (tool.status === 'available' && tool.inStock > 0);

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesAvailable;
    });

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedBrand, priceRange, sortBy, showAvailable]);

  const handleToolClick = (toolId: string) => {
    navigate(`/product/${toolId}`);
  };

  const handleAddToCart = (tool: Tool) => {
    addToCart({
      id: tool._id,
      name: tool.name,
      price: tool.price,
      image: tool.images[0] || '/img/5e130715-b755-4ab5-82af-c9e448995766.jpg',
      category: tool.category,
      duration: 1
    });
    
    toast({
      title: 'Добавлено в корзину',
      description: `${tool.name} добавлен в корзину`
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBrand('Все бренды');
    setPriceRange([0, 3000]);
    setShowAvailable(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Icon name="Wrench" className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">ToolRental</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">Главная</a>
              <a href="/catalog" className="text-blue-600 font-medium">Каталог</a>
              <a href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">Услуги</a>
              <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">О нас</a>
            </nav>
            <Button size="sm">
              <Icon name="User" className="h-4 w-4 mr-2" />
              Войти
            </Button>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Каталог инструментов</h1>
              <p className="text-gray-600 mt-2">Найдено {filteredTools.length} инструментов</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Вид:</span>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Icon name="Grid3x3" className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <Icon name="List" className="h-4 w-4" />
                </Button>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Сортировать по" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">По названию</SelectItem>
                  <SelectItem value="price-low">Сначала дешёвые</SelectItem>
                  <SelectItem value="price-high">Сначала дорогие</SelectItem>
                  <SelectItem value="rating">По рейтингу</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Mobile Filters */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Icon name="Filter" className="h-4 w-4 mr-2" />
                      Фильтры
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Фильтры</SheetTitle>
                      <SheetDescription>Настройте параметры поиска</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      {/* Mobile filter content will be here */}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop Filters */}
              <div className="hidden lg:block space-y-6">
                <CatalogFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  selectedBrand={selectedBrand}
                  onBrandChange={setSelectedBrand}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  showAvailable={showAvailable}
                  onShowAvailableChange={setShowAvailable}
                  categories={categories}
                  brands={brands}
                  onResetFilters={resetFilters}
                />
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <Icon name="Loader2" className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Загрузка каталога...</h3>
              </div>
            ) : filteredTools.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Search" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ничего не найдено</h3>
                <p className="text-gray-600">Попробуйте изменить параметры поиска</p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredTools.map((tool) => (
                  <ToolCard
                    key={tool._id}
                    tool={tool}
                    viewMode={viewMode}
                    onAddToCart={handleAddToCart}
                    onClick={handleToolClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}