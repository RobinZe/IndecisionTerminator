import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { sendChatStream } from '@/utils/chat';
import { useToast } from '@/hooks/use-toast';

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) {
      toast({
        title: '请输入内容',
        description: '请描述您的选择困难',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);

    const systemPrompt = `你是一个决策辅助智能体。用户会描述他们的选择困难，你需要：
1. 分析用户的问题类型
2. 选择最合适的工具（掷硬币/掷色子/概率转盘/AI分析/答案之书）
3. 提取用户输入中的具体选项

请严格按照以下JSON格式返回，不要有任何其他文字：
{
  "tool": "coin-flip|dice-roll|wheel|ai-analysis|answer-book",
  "options": ["选项1", "选项2", ...],
  "probabilities": [50, 50, ...],
  "reasoning": "选择此工具的原因"
}

工具选择规则：
- 掷硬币(coin-flip)：恰好2个概率相等的选项的简单决策
- 掷色子(dice-roll)：3个或6个概率相等的选项的决策
- 概率转盘(wheel)：需要考虑权重的多选项决策，或超过6个选项
- AI分析(ai-analysis)：需要深入分析优劣势的复杂决策
- 答案之书(answer-book)：寻求灵感启发的决策`;

    let assistantMessage = '';

    try {
      await sendChatStream({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
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
              
              const toolPath = `/${analysis.tool}`;
              const state = {
                options: analysis.options || [],
                probabilities: analysis.probabilities || [],
                reasoning: analysis.reasoning
              };
              
              navigate(toolPath, { state });
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
            setIsAnalyzing(false);
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
    <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold gradient-text">
              选择困难症终结者
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mb-1">
            AI智能决策助手
          </p>
          <p className="text-sm text-muted-foreground">
            告诉我您的选择困难，我会为您选择最合适的决策工具
          </p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  描述您的选择困难
                </label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="例如：我在考虑今晚吃火锅还是烧烤&#10;或：我需要在三个工作机会中选择一个&#10;或：我想知道是否应该换工作"
                  disabled={isAnalyzing}
                  rows={5}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!input.trim() || isAnalyzing}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI正在分析中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    开始分析
                  </>
                )}
              </Button>

              <div className="bg-muted rounded-lg p-3 space-y-1.5">
                <p className="text-sm font-medium text-foreground">💡 提示</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• 清晰描述您的选择场景和具体选项</li>
                  <li>• AI会自动为您选择最合适的决策工具</li>
                  <li>• 支持简单选择、复杂决策、灵感启发等多种场景</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <p className="text-center text-sm font-medium text-foreground mb-4">
            支持以下决策方式：
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Card
              className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all"
              onClick={() => navigate('/coin-flip')}
            >
              <CardContent className="p-3 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🪙</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm text-foreground">掷硬币</h3>
                  <p className="text-xs text-muted-foreground">二选一决策</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all"
              onClick={() => navigate('/dice-roll')}
            >
              <CardContent className="p-3 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎲</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm text-foreground">掷色子</h3>
                  <p className="text-xs text-muted-foreground">2-6个选项</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all"
              onClick={() => navigate('/wheel')}
            >
              <CardContent className="p-3 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-chart-3 to-chart-1 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎡</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm text-foreground">概率转盘</h3>
                  <p className="text-xs text-muted-foreground">自定义权重</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all"
              onClick={() => navigate('/ai-analysis')}
            >
              <CardContent className="p-3 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-chart-4 to-chart-5 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">✨</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm text-foreground">AI分析</h3>
                  <p className="text-xs text-muted-foreground">深度分析</p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer border-2 hover:border-primary hover:shadow-lg transition-all col-span-2"
              onClick={() => navigate('/answer-book')}
            >
              <CardContent className="p-3 flex items-center gap-2.5 justify-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📖</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm text-foreground">答案之书</h3>
                  <p className="text-xs text-muted-foreground">寻求灵感启发</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
