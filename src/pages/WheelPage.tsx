import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Trash2, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendChatStream } from '@/utils/chat';

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
  const [chatInput, setChatInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

    // 根据概率选择结果
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedItem: WheelItem | null = null;
    let selectedIndex = 0;

    for (let i = 0; i < filledItems.length; i++) {
      cumulative += Number(filledItems[i].probability);
      if (random <= cumulative) {
        selectedItem = filledItems[i];
        selectedIndex = i;
        break;
      }
    }

    if (!selectedItem) {
      selectedItem = filledItems[filledItems.length - 1];
      selectedIndex = filledItems.length - 1;
    }

    // 计算选中项的中心角度
    let targetAngle = 0;
    for (let i = 0; i < selectedIndex; i++) {
      targetAngle += (Number(filledItems[i].probability) / 100) * 360;
    }
    targetAngle += ((Number(selectedItem.probability) / 100) * 360) / 2;

    // 计算最终旋转角度：多转几圈 + 目标角度
    // 指针在顶部（0度），所以目标角度需要调整
    const spins = 5 + Math.random() * 2;
    const finalAngle = 360 * spins + (360 - targetAngle);
    const newRotation = rotation + finalAngle;
    
    setRotation(newRotation);

    setTimeout(() => {
      setResult(selectedItem!.name);
      setIsSpinning(false);
    }, 3000);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isAnalyzing) return;

    const userInput = chatInput.trim();
    setChatInput('');
    setIsAnalyzing(true);

    const systemPrompt = `你是一个决策辅助智能体。用户正在使用概率转盘功能，他们可能想要：
1. 修改当前功能的参数
2. 切换到其他功能

请严格按照以下JSON格式返回，不要有任何其他文字：
{
  "action": "modify|switch",
  "tool": "coin-flip|dice-roll|wheel|ai-analysis|answer-book",
  "options": ["选项1", "选项2", ...],
  "probabilities": [50, 50, ...],
  "reasoning": "操作原因"
}`;

    let assistantMessage = '';

    try {
      await sendChatStream({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
        onUpdate: (content: string) => {
          assistantMessage = content;
        },
        onComplete: () => {
          setIsAnalyzing(false);
          try {
            const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const analysis = JSON.parse(jsonMatch[0]);
              
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
                toast({
                  title: '参数已更新',
                  description: analysis.reasoning
                });
              }
            } else {
              throw new Error('无法解析AI响应');
            }
          } catch (error) {
            console.error('解析AI响应失败:', error);
            toast({
              title: '分析失败',
              description: '无法理解您的需求，请尝试更清晰地描述',
              variant: 'destructive'
            });
          }
        },
        onError: (error: Error) => {
          console.error('AI分析错误:', error);
          setIsAnalyzing(false);
          toast({
            title: 'AI分析失败',
            description: '请稍后重试',
            variant: 'destructive'
          });
        }
      });
    } catch (error) {
      console.error('发送请求失败:', error);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 pb-28">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl gradient-text">
                设置选项
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`name-${item.id}`} className="text-sm">选项 {index + 1}</Label>
                    <Input
                      id={`name-${item.id}`}
                      placeholder="输入选项名称"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      disabled={isSpinning}
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label htmlFor={`prob-${item.id}`} className="text-sm">概率</Label>
                    <Input
                      id={`prob-${item.id}`}
                      type="number"
                      min="0"
                      max="100"
                      value={item.probability}
                      onChange={(e) => updateItem(item.id, 'probability', Number(e.target.value))}
                      disabled={isSpinning}
                      className="text-sm"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 2 || isSpinning}
                    className="h-9 w-9"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <Button
                onClick={addItem}
                variant="outline"
                className="w-full h-9"
                disabled={isSpinning}
              >
                <Plus className="w-4 h-4 mr-2" />
                添加选项
              </Button>

              <Button
                onClick={normalizeProbabilities}
                variant="secondary"
                className="w-full h-9"
                disabled={isSpinning}
              >
                归一化概率
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl text-center gradient-text">
                概率转盘
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center py-4">
                <div className="relative w-64 h-64">
                  {/* 顶部指针 - 固定不动 */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10" style={{ top: '-8px' }}>
                    <div className="flex flex-col items-center">
                      <div className="w-0 h-0 border-l-[16px] border-r-[16px] border-t-[24px] border-l-transparent border-r-transparent border-t-red-600 drop-shadow-lg" />
                      <div className="w-1 h-4 bg-red-600" />
                    </div>
                  </div>
                  
                  {/* 转盘 - 旋转 */}
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

                      // 定义低饱和度的颜色数组
                      const colors = [
                        'hsl(210, 40%, 65%)',  // 柔和蓝色
                        'hsl(150, 35%, 60%)',  // 柔和绿色
                        'hsl(30, 45%, 65%)',   // 柔和橙色
                        'hsl(280, 35%, 65%)',  // 柔和紫色
                        'hsl(350, 40%, 65%)',  // 柔和红色
                        'hsl(180, 35%, 60%)',  // 柔和青色
                        'hsl(60, 40%, 65%)',   // 柔和黄色
                        'hsl(320, 35%, 65%)',  // 柔和粉色
                      ];

                      return (
                        <g key={item.id}>
                          <path
                            d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={colors[index % colors.length]}
                            stroke="white"
                            strokeWidth="2"
                          />
                          <text
                            x={textX}
                            y={textY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="fill-gray-800 font-bold text-xs"
                            transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                          >
                            {item.name.length > 6 ? item.name.slice(0, 6) + '...' : item.name}
                          </text>
                        </g>
                      );
                    })}
                    {/* 中心圆 */}
                    <circle cx="100" cy="100" r="15" fill="white" stroke="#333" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {result && !isSpinning && (
                <div className="text-center space-y-1 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">结果是</p>
                  <p className="text-2xl font-bold text-primary">{result}</p>
                </div>
              )}

              <Button
                onClick={handleSpin}
                disabled={isSpinning || items.filter(i => i.name.trim()).length < 2}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10"
              >
                {isSpinning ? '转盘旋转中...' : result ? '再次转动' : '开始转盘'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-3">
        <div className="max-w-6xl mx-auto flex gap-2">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="对当前方案不满意？输入修改要求..."
            disabled={isAnalyzing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatSubmit();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleChatSubmit}
            disabled={!chatInput.trim() || isAnalyzing}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WheelPage;
