import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChatPanel from '@/components/ChatPanel';

interface WheelItem {
  id: string;
  name: string;
  probability: number;
}

const WheelPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [items, setItems] = useState<WheelItem[]>([
    { id: '1', name: '', probability: 50 },
    { id: '2', name: '', probability: 50 }
  ]);
  const [result, setResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const state = location.state as any;
    if (state?.options && state.options.length > 0) {
      const newItems: WheelItem[] = state.options.map((opt: string, idx: number) => ({
        id: Date.now().toString() + idx,
        name: opt,
        probability: state.probabilities?.[idx] || (100 / state.options.length)
      }));
      setItems(newItems);
    }
  }, [location.state]);

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
    const total = items.reduce((sum, item) => sum + Number(item.probability), 0);
    if (total === 0) return;
    setItems(items.map(item => ({
      ...item,
      probability: (Number(item.probability) / total) * 100
    })));
  };

  const handleSpin = () => {
    const filledItems = items.filter(item => item.name.trim());
    if (filledItems.length < 2) {
      toast({
        title: '至少需要2个有效选项',
        variant: 'destructive'
      });
      return;
    }

    normalizeProbabilities();

    setIsSpinning(true);
    setResult(null);

    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedItem: WheelItem | null = null;

    for (const item of filledItems) {
      cumulative += Number(item.probability);
      if (random <= cumulative) {
        selectedItem = item;
        break;
      }
    }

    if (!selectedItem) {
      selectedItem = filledItems[filledItems.length - 1];
    }

    const spins = 5 + Math.random() * 3;
    const newRotation = rotation + 360 * spins;
    setRotation(newRotation);

    setTimeout(() => {
      setResult(selectedItem!.name);
      setIsSpinning(false);
    }, 3000);
  };

  const handleChatAnalysis = (analysis: any) => {
    if (analysis.action === 'switch' && analysis.tool !== 'wheel') {
      const toolPath = `/${analysis.tool}`;
      navigate(toolPath, { 
        state: {
          options: analysis.options || [],
          probabilities: analysis.probabilities || []
        }
      });
    } else if (analysis.options && analysis.options.length > 0) {
      const newItems: WheelItem[] = analysis.options.map((opt: string, idx: number) => ({
        id: Date.now().toString() + idx,
        name: opt,
        probability: analysis.probabilities?.[idx] || (100 / analysis.options.length)
      }));
      setItems(newItems);
      setResult(null);
    }
    setIsChatOpen(false);
  };

  const colors = [
    'from-primary to-primary-glow',
    'from-secondary to-accent',
    'from-chart-1 to-chart-2',
    'from-chart-3 to-chart-4',
    'from-chart-5 to-primary',
    'from-accent to-secondary'
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">
                设置选项
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-end">
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
                  <div className="w-24 space-y-2">
                    <Label htmlFor={`prob-${item.id}`}>概率</Label>
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

              <Button
                onClick={addItem}
                variant="outline"
                className="w-full"
                disabled={isSpinning}
              >
                <Plus className="w-4 h-4 mr-2" />
                添加选项
              </Button>

              <Button
                onClick={normalizeProbabilities}
                variant="secondary"
                className="w-full"
                disabled={isSpinning}
              >
                归一化概率
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl text-center gradient-text">
                概率转盘
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center py-8">
                <div className="relative w-64 h-64">
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
                    }}
                  >
                    {items.filter(item => item.name.trim()).map((item, index, arr) => {
                      const startAngle = arr.slice(0, index).reduce((sum, i) => sum + (Number(i.probability) / 100) * 360, 0);
                      const angle = (Number(item.probability) / 100) * 360;
                      const endAngle = startAngle + angle;

                      const x1 = 100 + 90 * Math.cos((startAngle - 90) * Math.PI / 180);
                      const y1 = 100 + 90 * Math.sin((startAngle - 90) * Math.PI / 180);
                      const x2 = 100 + 90 * Math.cos((endAngle - 90) * Math.PI / 180);
                      const y2 = 100 + 90 * Math.sin((endAngle - 90) * Math.PI / 180);

                      const largeArc = angle > 180 ? 1 : 0;

                      const textAngle = startAngle + angle / 2 - 90;
                      const textX = 100 + 60 * Math.cos(textAngle * Math.PI / 180);
                      const textY = 100 + 60 * Math.sin(textAngle * Math.PI / 180);

                      return (
                        <g key={item.id}>
                          <path
                            d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            className={`fill-current text-primary opacity-${90 - index * 10}`}
                            stroke="white"
                            strokeWidth="2"
                          />
                          <text
                            x={textX}
                            y={textY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-white font-bold text-xs"
                            transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                          >
                            {item.name.length > 6 ? item.name.slice(0, 6) + '...' : item.name}
                          </text>
                        </g>
                      );
                    })}
                    <circle cx="100" cy="100" r="15" fill="white" />
                  </svg>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                    <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-red-500" />
                  </div>
                </div>
              </div>

              {result && !isSpinning && (
                <div className="text-center space-y-2 p-4 bg-primary/10 rounded-lg">
                  <p className="text-lg text-muted-foreground">结果是</p>
                  <p className="text-3xl font-bold text-primary">{result}</p>
                </div>
              )}

              <Button
                onClick={handleSpin}
                disabled={isSpinning || items.filter(i => i.name.trim()).length < 2}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                {isSpinning ? '转盘旋转中...' : result ? '再次转动' : '开始转盘'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onAnalysisComplete={handleChatAnalysis}
        currentPage="概率转盘"
      />
    </div>
  );
};

export default WheelPage;
