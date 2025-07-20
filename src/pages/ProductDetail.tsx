import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { BookingCard } from '@/components/product/BookingCard';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { api, Tool, Review } from '@/lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';



export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [tool, setTool] = useState<Tool | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/catalog');
      return;
    }
    
    loadToolData();
  }, [id, navigate]);

  const loadToolData = async () => {
    if (!id) return;
    
    try {
      const [toolResponse, reviewsResponse] = await Promise.all([
        api.getTool(id),
        api.getToolReviews(id)
      ]);
      
      setTool(toolResponse.data);
      setReviews(reviewsResponse.data.reviews);
    } catch (error) {
      console.error('Failed to load tool data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить информацию об инструменте',
        variant: 'destructive'
      });
      navigate('/catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (data: {
    startDate?: Date;
    endDate?: Date;
    days: number;
    quantity: number;
    totalPrice: number;
  }) => {
    if (!tool) return;
    
    addToCart({
      id: tool._id,
      name: tool.name,
      price: tool.price,
      image: tool.images[0] || '/img/5e130715-b755-4ab5-82af-c9e448995766.jpg',
      category: tool.category,
      duration: data.days
    });
    
    toast({
      title: 'Добавлено в корзину',
      description: `${tool.name} добавлен в корзину на ${data.days} дней`
    });
  };

  const rentalPeriods = [
    { days: 1, price: tool?.price || 0, discount: 0 },
    { days: 3, price: Math.round((tool?.price || 0) * 3 * 0.89), discount: 11 },
    { days: 7, price: Math.round((tool?.price || 0) * 7 * 0.83), discount: 17 },
    { days: 14, price: Math.round((tool?.price || 0) * 14 * 0.75), discount: 25 },
    { days: 30, price: Math.round((tool?.price || 0) * 30 * 0.67), discount: 33 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Инструмент не найден</h1>
          <Button onClick={() => navigate('/catalog')}>
            Вернуться к каталогу
          </Button>
        </div>
      </div>
    );
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
              <a href="/catalog" className="text-gray-600 hover:text-blue-600 transition-colors">Каталог</a>
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

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <a href="/" className="text-gray-600 hover:text-blue-600">Главная</a>
            <Icon name="ChevronRight" className="h-4 w-4 text-gray-400" />
            <a href="/catalog" className="text-gray-600 hover:text-blue-600">Каталог</a>
            <Icon name="ChevronRight" className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900">{tool.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <ProductGallery
              images={tool.images}
              name={tool.name}
              subcategory={tool.subcategory}
              available={tool.status === 'available' && tool.inStock > 0}
            />
          </div>

          {/* Right Column - Details & Booking */}
          <div className="space-y-6">
            {/* Product Info */}
            <ProductInfo
              name={tool.name}
              brand={tool.brand}
              rating={tool.rating}
              reviewCount={tool.reviewCount}
              description={tool.description}
              features={tool.features}
            />

            {/* Booking Card */}
            <BookingCard
              price={tool.price}
              inStock={tool.inStock}
              rentalPeriods={rentalPeriods}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>

        {/* Additional Information Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Описание</TabsTrigger>
              <TabsTrigger value="specifications">Характеристики</TabsTrigger>
              <TabsTrigger value="included">Комплектация</TabsTrigger>
              <TabsTrigger value="reviews">Отзывы ({tool.reviewCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-line text-gray-700">
                      {tool.fullDescription || tool.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(tool.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="included" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(tool.included || []).map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Icon name="Check" className="h-5 w-5 text-green-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Review Summary */}
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {tool.rating}
                        </div>
                        <div className="flex justify-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Icon 
                              key={i} 
                              name="Star" 
                              className={`h-5 w-5 ${
                                i < Math.floor(tool.rating) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600">
                          Основано на {tool.reviewCount} отзывах
                        </p>
                      </div>
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center space-x-2">
                            <span className="text-sm w-8">{rating}</span>
                            <Icon name="Star" className="h-4 w-4 text-yellow-400" />
                            <Progress value={rating === 5 ? 80 : rating === 4 ? 15 : 5} className="flex-1" />
                            <span className="text-sm text-gray-600 w-8">
                              {rating === 5 ? '80%' : rating === 4 ? '15%' : '5%'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review._id}>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarFallback>
                              {review.customerId.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">Пользователь</h4>
                                <div className="flex items-center space-x-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Icon 
                                        key={i} 
                                        name="Star" 
                                        className={`h-4 w-4 ${
                                          i < review.rating 
                                            ? 'text-yellow-400 fill-current' 
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: ru })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            <div className="flex items-center space-x-4">
                              <Button variant="ghost" size="sm">
                                <Icon name="ThumbsUp" className="h-4 w-4 mr-1" />
                                Полезно ({review.helpfulVotes})
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Icon name="Flag" className="h-4 w-4 mr-1" />
                                Пожаловаться
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Add Review */}
                {user && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Оставить отзыв</CardTitle>
                      <CardDescription>
                        Поделитесь своим опытом использования этого инструмента
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-900 mb-2 block">
                            Оценка
                          </label>
                          <div className="flex space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Icon 
                                key={i} 
                                name="Star" 
                                className="h-6 w-6 text-gray-300 cursor-pointer hover:text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-900 mb-2 block">
                            Отзыв
                          </label>
                          <Textarea 
                            placeholder="Расскажите о своем опыте использования..."
                            rows={4}
                          />
                        </div>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          Отправить отзыв
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}