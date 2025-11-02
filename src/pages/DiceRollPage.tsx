import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DiceRollPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);

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

  return (
    <div className="min-h-screen bg-background py-12 px-4">
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
    </div>
  );
};

export default DiceRollPage;
