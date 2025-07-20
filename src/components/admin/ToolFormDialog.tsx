import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tool } from '@/lib/api';

interface ToolFormDialogProps {
  tool?: Tool | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (toolData: Partial<Tool>) => void;
  categories: Array<{ name: string; subcategories: string[] }>;
  brands: string[];
}

export const ToolFormDialog = ({ 
  tool, 
  isOpen, 
  onClose, 
  onSave, 
  categories, 
  brands 
}: ToolFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    subcategory: '',
    price: '',
    description: '',
    fullDescription: '',
    power: '',
    weight: '',
    features: '',
    included: '',
    inStock: '',
    totalStock: ''
  });

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name,
        brand: tool.brand,
        category: tool.category,
        subcategory: tool.subcategory,
        price: tool.price.toString(),
        description: tool.description,
        fullDescription: tool.fullDescription || '',
        power: tool.specifications.power || '',
        weight: tool.specifications.weight || '',
        features: tool.features.join(', '),
        included: tool.included?.join(', ') || '',
        inStock: tool.inStock.toString(),
        totalStock: tool.totalStock.toString()
      });
    } else {
      setFormData({
        name: '',
        brand: '',
        category: '',
        subcategory: '',
        price: '',
        description: '',
        fullDescription: '',
        power: '',
        weight: '',
        features: '',
        included: '',
        inStock: '',
        totalStock: ''
      });
    }
  }, [tool]);

  const handleSubmit = () => {
    const toolData: Partial<Tool> = {
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      subcategory: formData.subcategory,
      price: Number(formData.price),
      description: formData.description,
      fullDescription: formData.fullDescription,
      specifications: {
        power: formData.power,
        weight: formData.weight,
      },
      features: formData.features.split(',').map(f => f.trim()).filter(f => f),
      included: formData.included.split(',').map(f => f.trim()).filter(f => f),
      inStock: Number(formData.inStock),
      totalStock: Number(formData.totalStock),
      images: ['/img/5e130715-b755-4ab5-82af-c9e448995766.jpg'],
      status: 'available',
      isActive: true
    };

    onSave(toolData);
  };

  const selectedCategory = categories.find(cat => cat.name === formData.category);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tool ? 'Редактировать инструмент' : 'Добавить новый инструмент'}</DialogTitle>
          <DialogDescription>
            {tool ? 'Изменение информации об инструменте' : 'Заполните информацию о новом инструменте для каталога'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название инструмента</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Перфоратор Bosch..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Бренд</Label>
            <Select value={formData.brand} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите бренд" />
              </SelectTrigger>
              <SelectContent>
                {brands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Категория</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: '' })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subcategory">Подкатегория</Label>
            <Select 
              value={formData.subcategory} 
              onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
              disabled={!selectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите подкатегорию" />
              </SelectTrigger>
              <SelectContent>
                {selectedCategory?.subcategories.map(subcategory => (
                  <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Цена за день (₽)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="1200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inStock">Количество на складе</Label>
            <Input
              id="inStock"
              type="number"
              value={formData.inStock}
              onChange={(e) => setFormData({ ...formData, inStock: e.target.value })}
              placeholder="5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalStock">Общее количество</Label>
            <Input
              id="totalStock"
              type="number"
              value={formData.totalStock}
              onChange={(e) => setFormData({ ...formData, totalStock: e.target.value })}
              placeholder="5"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="power">Мощность</Label>
            <Input
              id="power"
              value={formData.power}
              onChange={(e) => setFormData({ ...formData, power: e.target.value })}
              placeholder="1500W"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Вес</Label>
            <Input
              id="weight"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="5.8кг"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="description">Краткое описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Краткое описание инструмента..."
              rows={2}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="fullDescription">Полное описание</Label>
            <Textarea
              id="fullDescription"
              value={formData.fullDescription}
              onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              placeholder="Подробное описание инструмента..."
              rows={4}
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="features">Особенности (через запятую)</Label>
            <Input
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              placeholder="SDS-Max, Антивибрация, Регулировка оборотов"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="included">Комплектация (через запятую)</Label>
            <Input
              id="included"
              value={formData.included}
              onChange={(e) => setFormData({ ...formData, included: e.target.value })}
              placeholder="Инструмент, Кейс, Инструкция"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            {tool ? 'Сохранить изменения' : 'Добавить инструмент'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};