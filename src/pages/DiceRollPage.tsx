import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendChatStream } from '@/utils/chat';

const DiceRollPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const state = location.state as any;
    if (state?.options && state.options.length > 0) {
      const optionsText = state.options.join('，');
      setInput(optionsText);
      
      const diceEvents: string[] = [];
      for (let i = 0; i < 6; i++) {
        diceEvents.push(state.options[i % state.options.length]);
      }
      setEvents(diceEvents);
    }
  }, [location.state]);

  const parseEvents = () => {
    const text = input.trim();
    if (!text) {
      toast({
        title: '输入不能为空',
        description: '请输入至少一个事件',
        variant: 'destructive'
      });
      return;
    }

    const parsed = text
      .split(/[,，、\n]/)
      .map(e => e.trim())
      .filter(e => e.length > 0);

    if (parsed.length === 0) {
      toast({
        title: '未识别到事件',
        description: '请输入有效的事件内容',
        variant: 'destructive'
      });
      return;
    }

    const diceEvents: string[] = [];
    for (let i = 0; i < 6; i++) {
      diceEvents.push(parsed[i % parsed.length]);
    }

    setEvents(diceEvents);
    toast({
      title: '识别成功',
      description: `已为色子的6个面分配事件`
    });
  };

  const handleRoll = () => {
    if (events.length === 0) {
      toast({
        title: '请先识别事件',
        description: '点击"识别事件"按钮处理输入',
        variant: 'destructive'
      });
      return;
    }

    setIsRolling(true);
    setResult(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * 6);
      setResult(events[randomIndex]);
      setIsRolling(false);
    }, 1500);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isAnalyzing) return;

    const userInput = chatInput.trim();
    setChatInput('');
    setIsAnalyzing(true);

    const systemPrompt = `你是一个决策辅助智能体。用户正在使用掷色子功能，他们可能想要：
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
              
              if (analysis.action === 'switch' && analysis.tool !== 'dice-roll') {
                const toolPath = `/${analysis.tool}`;
                navigate(toolPath, { 
                  state: {
                    options: analysis.options || [],
                    probabilities: analysis.probabilities || []
                  }
                });
              } else if (analysis.options && analysis.options.length > 0) {
                const optionsText = analysis.options.join('，');
                setInput(optionsText);
                
                const diceEvents: string[] = [];
                for (let i = 0; i < 6; i++) {
                  diceEvents.push(analysis.options[i % analysis.options.length]);
                }
                setEvents(diceEvents);
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
    <div className="min-h-screen bg-background py-12 px-4 pb-32">
      <div className="max-w-2xl mx-auto">
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
              掷色子
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="events">输入事件（用逗号、顿号或换行分隔）</Label>
              <Textarea
                id="events"
                placeholder="例如：看电影，打游戏，读书，运动，睡觉，学习"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isRolling}
                rows={4}
              />
            </div>

            <Button
              onClick={parseEvents}
              disabled={!input.trim() || isRolling}
              variant="outline"
              className="w-full"
            >
              识别事件
            </Button>

            {events.length > 0 && (
              <div className="space-y-2">
                <Label>色子面分配</Label>
                <div className="grid grid-cols-3 gap-2">
                  {events.map((event, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg bg-muted text-center text-sm"
                    >
                      <div className="font-bold text-primary mb-1">面 {index + 1}</div>
                      <div className="text-foreground">{event}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center py-8">
              {isRolling ? (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center animate-bounce">
                  <span className="text-5xl">🎲</span>
                </div>
              ) : result ? (
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mx-auto">
                    <span className="text-5xl">🎲</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg text-muted-foreground">结果是</p>
                    <p className="text-3xl font-bold text-secondary">{result}</p>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-muted to-border flex items-center justify-center">
                  <span className="text-5xl">🎲</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleRoll}
              disabled={events.length === 0 || isRolling}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              size="lg"
            >
              {isRolling ? '摇色子中...' : result ? '再次摇色子' : '摇色子'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t-2 border-border p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
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

export default DiceRollPage;
