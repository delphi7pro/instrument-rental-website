import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';

interface RentalPeriod {
  days: number;
  price: number;
  discount: number;
}

interface BookingCardProps {
  price: number;
  inStock: number;
  rentalPeriods: RentalPeriod[];
  onAddToCart: (data: {
    startDate?: Date;
    endDate?: Date;
    days: number;
    quantity: number;
    totalPrice: number;
  }) => void;
}

export const BookingCard = ({ price, inStock, rentalPeriods, onAddToCart }: BookingCardProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [rentalDays, setRentalDays] = useState(1);
  const [quantity, setQuantity] = useState(1);

  const selectedPeriod = rentalPeriods.find(p => p.days === rentalDays) || rentalPeriods[0];
  const totalPrice = selectedPeriod.price * quantity;
  const savings = (price * rentalDays * quantity) - totalPrice;

  const handleAddToCart = () => {
    onAddToCart({
      startDate,
      endDate,
      days: rentalDays,
      quantity,
      totalPrice
    });
  };

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="text-xl">Забронировать</CardTitle>
        <CardDescription>Выберите период аренды</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rental Period */}
        <div>
          <label className="text-sm font-medium text-gray-900 mb-2 block">
            Период аренды
          </label>
          <div className="grid grid-cols-3 gap-2">
            {rentalPeriods.map((period) => (
              <button
                key={period.days}
                onClick={() => setRentalDays(period.days)}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  rentalDays === period.days
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-medium">
                  {period.days} {period.days === 1 ? 'день' : 'дней'}
                </div>
                {period.discount > 0 && (
                  <div className="text-xs text-green-600">
                    -{period.discount}%
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">
              Дата начала
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Icon name="Calendar" className="h-4 w-4 mr-2" />
                  {startDate ? format(startDate, 'dd.MM', { locale: ru }) : 'Выберите'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    if (date) {
                      setEndDate(addDays(date, rentalDays));
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">
              Дата окончания
            </label>
            <Button variant="outline" className="w-full justify-start" disabled>
              <Icon name="Calendar" className="h-4 w-4 mr-2" />
              {endDate ? format(endDate, 'dd.MM', { locale: ru }) : 'Автоматически'}
            </Button>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="text-sm font-medium text-gray-900 mb-2 block">
            Количество
          </label>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Icon name="Minus" className="h-4 w-4" />
            </Button>
            <span className="font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.min(inStock, quantity + 1))}
              disabled={quantity >= inStock}
            >
              <Icon name="Plus" className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 ml-2">
              Доступно: {inStock}
            </span>
          </div>
        </div>

        <Separator />

        {/* Price Summary */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Базовая цена</span>
            <span>{price * rentalDays * quantity}₽</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Скидка</span>
              <span>-{savings}₽</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Итого</span>
            <span>{totalPrice}₽</span>
          </div>
          <p className="text-sm text-gray-600 text-center">
            {Math.round(totalPrice / rentalDays)}₽ за день
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleAddToCart}
            disabled={!startDate}
          >
            <Icon name="ShoppingCart" className="h-4 w-4 mr-2" />
            Добавить в корзину
          </Button>
          <Button variant="outline" className="w-full">
            <Icon name="Heart" className="h-4 w-4 mr-2" />
            В избранное
          </Button>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-2">Нужна консультация?</p>
          <Button variant="outline" size="sm">
            <Icon name="Phone" className="h-4 w-4 mr-2" />
            +7 (495) 123-45-67
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};