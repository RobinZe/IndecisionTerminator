import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WheelItem {
  id: string;
  name: string;
  probability: number;
}

const WheelPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<WheelItem[]>([
    { id: '1', name: '', probability: 50 },
    { id: '2', name: '', probability: 50 }
  ]);
  const [result, setResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const addItem = () => {
    const newId = Date.now().toString();
    const equalProb = 100 / (items.length + 1);
    const updatedItems = items.map(item => ({
      ...item,
      probability: equalProb
    }));
    setItems([...updatedItems, { id: newId, name: '', probability: equalProb }]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 2) {
      toast({
        title: '至少需要2个选项',
        variant: 'destructive'
      });
      return;
    }
    const filtered = items.filter(item => item.id !== id);
    const equalProb = 100 / filtered.length;
    setItems(filtered.map(item => ({ ...item, probability: equalProb })));
  };

  const updateItem = (id: string, field: 'name' | 'probability', value: string | number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const normalizeProbabilities = () => {
    const total = items.reduce((sum, item) => sum + item.probability, 0);
    if (total === 0) return;
    setItems(items.map(item => ({
      ...item,
      probability: (item.probability / total) * 100
    })));
  };

  const handleSpin = () => {
    const hasEmptyNames = items.some(item => !item.name.trim());
    if (hasEmptyNames) {
      toast({
        title: '请填写所有选项名称',
        variant: 'destructive'
      });
      return;
    }

    normalizeProbabilities();

    setIsSpinning(true);
    setResult(null);

    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedItem = items[0];

    for (const item of items) {
      cumulative += item.probability;
      if (random <= cumulative) {
        selectedItem = item;
        break;
      }
    }

    const spins = 5 + Math.random() * 3;
    const newRotation = rotation + 360 * spins;
    setRotation(newRotation);

    setTimeout(() => {
      setResult(selectedItem.name);
      setIsSpinning(false);
    }, 3000);
  };

  const colors = [
    'from-primary to-primary-glow',
    'from-secondary to-accent',
    'from-chart-3 to-chart-1',
    'from-chart-4 to-chart-5',
    'from-primary to-secondary'
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-3xl text-center gradient-text">
              概率转盘
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`name-${item.id}`}>选项 {index + 1}</Label>
                    <Input
                      id={`name-${item.id}`}
                      placeholder="输入选项名称"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      disabled={isSpinning}
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label htmlFor={`prob-${item.id}`}>概率 %</Label>
                    <Input
                      id={`prob-${item.id}`}
                      type="number"
                      min="0"
                      max="100"
                      value={item.probability}
                      onChange={(e) => updateItem(item.id, 'probability', Number(e.target.value))}
                      disabled={isSpinning}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 2 || isSpinning}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              onClick={addItem}
              variant="outline"
              className="w-full"
              disabled={isSpinning}
            >
              <Plus className="w-4 h-4 mr-2" />
              添加选项
            </Button>

            <div className="flex justify-center py-8">
              {isSpinning ? (
                <div
                  className="w-48 h-48 rounded-full relative"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                  }}
                >
                  {items.map((item, index) => {
                    const angle = (360 / items.length) * index;
                    return (
                      <div
                        key={item.id}
                        className={`absolute inset-0 rounded-full bg-gradient-to-br ${colors[index % colors.length]}`}
                        style={{
                          clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((angle + 360 / items.length - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle + 360 / items.length - 90) * Math.PI / 180)}%)`
                        }}
                      />
                    );
                  })}
                  <div className="absolute inset-4 rounded-full bg-card flex items-center justify-center">
                    <span className="text-4xl">🎯</span>
                  </div>
                </div>
              ) : result ? (
                <div className="text-center space-y-4">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto">
                    <div className="w-40 h-40 rounded-full bg-card flex items-center justify-center">
                      <span className="text-5xl">🎉</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg text-muted-foreground">结果是</p>
                    <p className="text-3xl font-bold text-primary">{result}</p>
                  </div>
                </div>
              ) : (
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-muted to-border flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full bg-card flex items-center justify-center">
                    <span className="text-5xl">🎡</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleSpin}
              disabled={isSpinning}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isSpinning ? '转盘旋转中...' : result ? '再次转动' : '开始转盘'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WheelPage;
