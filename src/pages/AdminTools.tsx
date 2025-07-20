import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolsTable } from '@/components/admin/ToolsTable';
import { ToolFormDialog } from '@/components/admin/ToolFormDialog';
import { useAuth } from '@/hooks/useAuth';
import { api, Tool } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const AdminToolsManagement = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; subcategories: string[] }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);

  const brands = ['Bosch', 'DeWalt', 'Makita', 'Metabo', 'Milwaukee', 'Ryobi'];

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin');
      return;
    }

    loadData();
  }, [isAdmin, navigate]);

  const loadData = async () => {
    try {
      const [toolsResponse, categoriesResponse] = await Promise.all([
        api.getTools(),
        api.getCategories()
      ]);
      
      setTools(toolsResponse.data.tools);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Failed to load tools data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTools = useMemo(() => {
    let filtered = tools;

    if (searchQuery) {
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      const categoryName = categories.find(cat => cat.name === selectedCategory)?.name;
      if (categoryName) {
        filtered = filtered.filter(tool => tool.category === categoryName);
      }
    }

    return filtered;
  }, [tools, searchQuery, selectedCategory, categories]);

  const handleSaveTool = async (toolData: Partial<Tool>) => {
    try {
      if (editingTool) {
        await api.updateTool(editingTool._id, toolData);
        toast({
          title: 'Успех',
          description: 'Инструмент обновлен'
        });
      } else {
        await api.createTool(toolData);
        toast({
          title: 'Успех',
          description: 'Инструмент добавлен'
        });
      }
      
      await loadData();
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingTool(null);
    } catch (error) {
      console.error('Failed to save tool:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить инструмент',
        variant: 'destructive'
      });
    }
  };

  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTool = async (id: string) => {
    try {
      await api.deleteTool(id);
      toast({
        title: 'Успех',
        description: 'Инструмент удален'
      });
      await loadData();
    } catch (error) {
      console.error('Failed to delete tool:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить инструмент',
        variant: 'destructive'
      });
    }
  };

  const handleToggleAvailability = async (id: string, available: boolean) => {
    try {
      await api.updateTool(id, { 
        status: available ? 'available' : 'maintenance' 
      });
      await loadData();
    } catch (error) {
      console.error('Failed to update tool availability:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить доступность',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Icon name="Loader2" className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Управление инструментами</h1>
          <p className="text-gray-600">Полный контроль над каталогом инструментов</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить инструмент
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры и поиск</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по названию, бренду или категории..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Все категории" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tools Table */}
      <Card>
        <CardHeader>
          <CardTitle>Каталог инструментов ({filteredTools.length})</CardTitle>
          <CardDescription>
            Управление всеми инструментами в системе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToolsTable
            tools={filteredTools}
            onEdit={handleEditTool}
            onDelete={handleDeleteTool}
            onToggleAvailability={handleToggleAvailability}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <ToolFormDialog
        tool={editingTool}
        isOpen={isAddDialogOpen || isEditDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingTool(null);
        }}
        onSave={handleSaveTool}
        categories={categories}
        brands={brands}
      />
    </div>
  );
};

export default AdminToolsManagement;