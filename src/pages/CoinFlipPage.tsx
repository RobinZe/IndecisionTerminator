import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { sendChatStream } from '@/utils/chat';
import { useToast } from '@/hooks/use-toast';

const CoinFlipPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [heads, setHeads] = useState('');
  const [tails, setTails] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const state = location.state as any;
    if (state?.options && state.options.length >= 2) {
      setHeads(state.options[0]);
      setTails(state.options[1]);
    }
  }, [location.state]);

  const handleFlip = () => {
    if (!heads.trim() || !tails.trim()) {
      return;
    }

    setIsFlipping(true);
    setResult(null);

    setTimeout(() => {
      const isHeads = Math.random() < 0.5;
      setResult(isHeads ? heads : tails);
      setIsFlipping(false);
    }, 1500);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isAnalyzing) return;

    const userInput = chatInput.trim();
    setChatInput('');
    setIsAnalyzing(true);

    const systemPrompt = `你是一个决策辅助智能体。用户正在使用掷硬币功能，他们可能想要：
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
        endpoint: 'https://api-integrations.appmiaoda.com/app-79vic3pdvf9d/api-2bk93oeO9NlE/v2/chat/completions',
        apiId: import.meta.env.VITE_APP_ID,
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
              
              if (analysis.action === 'switch' && analysis.tool !== 'coin-flip') {
                const toolPath = `/${analysis.tool}`;
                navigate(toolPath, { 
                  state: {
                    options: analysis.options || [],
                    probabilities: analysis.probabilities || []
                  }
                });
              } else if (analysis.options && analysis.options.length >= 2) {
                setHeads(analysis.options[0]);
                setTails(analysis.options[1]);
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
              掷硬币
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heads">正面事件</Label>
                <Input
                  id="heads"
                  placeholder="输入正面对应的事件"
                  value={heads}
                  onChange={(e) => setHeads(e.target.value)}
                  disabled={isFlipping}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tails">反面事件</Label>
                <Input
                  id="tails"
                  placeholder="输入反面对应的事件"
                  value={tails}
                  onChange={(e) => setTails(e.target.value)}
                  disabled={isFlipping}
                />
              </div>
            </div>

            <div className="flex justify-center py-8">
              {isFlipping ? (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center animate-spin">
                  <div className="w-28 h-28 rounded-full bg-card flex items-center justify-center">
                    <span className="text-2xl font-bold">?</span>
                  </div>
                </div>
              ) : result ? (
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto">
                    <div className="w-28 h-28 rounded-full bg-card flex items-center justify-center">
                      <span className="text-3xl">🎯</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg text-muted-foreground">结果是</p>
                    <p className="text-3xl font-bold text-primary">{result}</p>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-muted to-border flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-card flex items-center justify-center">
                    <span className="text-4xl">🪙</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleFlip}
              disabled={!heads.trim() || !tails.trim() || isFlipping}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isFlipping ? '掷硬币中...' : result ? '再次掷硬币' : '掷硬币'}
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

export default CoinFlipPage;
