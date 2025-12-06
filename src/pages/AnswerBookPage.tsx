import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, BookOpen, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendChatStream } from '@/utils/chat';

const AnswerBookPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [answer, setAnswer] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const answers = [
    '是的，现在就去做吧',
    '不，这不是最好的时机',
    '也许，但需要更多思考',
    '绝对可以',
    '暂时不要',
    '听从你的内心',
    '寻求他人的建议',
    '相信自己的直觉',
    '再等等看',
    '勇敢地迈出这一步',
    '保持耐心',
    '这是一个好主意',
    '需要更多准备',
    '时机已经成熟',
    '重新考虑一下',
    '跟随你的梦想',
    '现在还不确定',
    '一切都会好起来的',
    '相信过程',
    '做你认为对的事',
    '不要急于决定',
    '这值得一试',
    '保持开放的心态',
    '专注于当下',
    '未来会给你答案',
    '相信命运的安排',
    '采取行动',
    '静观其变',
    '这是正确的方向',
    '需要改变策略',
    '坚持你的选择',
    '灵活应对',
    '保持乐观',
    '做好准备',
    '顺其自然',
    '积极面对',
    '寻找新的可能',
    '相信自己',
    '不要犹豫',
    '给自己一个机会',
    '这是值得的',
    '保持平衡',
    '相信你的能力'
  ];

  const handleFlip = () => {
    setIsFlipping(true);
    setAnswer(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * answers.length);
      setAnswer(answers[randomIndex]);
      setIsFlipping(false);
    }, 1500);
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isAnalyzing) return;

    const userInput = chatInput.trim();
    setChatInput('');
    setIsAnalyzing(true);

    const systemPrompt = `你是一个决策辅助智能体。用户正在使用答案之书功能，他们可能想要：
1. 切换到其他功能

请严格按照以下JSON格式返回，不要有任何其他文字：
{
  "action": "switch",
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
              
              if (analysis.action === 'switch' && analysis.tool !== 'answer-book') {
                const toolPath = `/${analysis.tool}`;
                navigate(toolPath, { 
                  state: {
                    options: analysis.options || [],
                    probabilities: analysis.probabilities || []
                  }
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
            <CardTitle className="text-3xl text-center gradient-text flex items-center justify-center gap-2">
              <BookOpen className="w-8 h-8" />
              答案之书
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center space-y-4">
              <p className="text-lg text-muted-foreground">
                在心中默念你的问题
              </p>
              <p className="text-sm text-muted-foreground">
                然后点击下方按钮，翻阅答案之书
              </p>
            </div>

            <div className="flex justify-center py-12">
              {isFlipping ? (
                <div className="relative">
                  <div className="w-64 h-80 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
                    <BookOpen className="w-24 h-24 text-white animate-bounce" />
                  </div>
                </div>
              ) : answer ? (
                <div className="relative">
                  <div className="w-64 h-80 rounded-2xl bg-gradient-to-br from-primary to-secondary p-8 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="text-6xl mb-4">✨</div>
                      <p className="text-xl font-bold text-white leading-relaxed">
                        {answer}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-64 h-80 rounded-2xl bg-gradient-to-br from-muted to-border flex items-center justify-center">
                    <BookOpen className="w-24 h-24 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleFlip}
              disabled={isFlipping}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              {isFlipping ? '翻阅中...' : answer ? '再次翻阅' : '翻阅答案之书'}
            </Button>

            {answer && (
              <div className="text-center text-sm text-muted-foreground">
                💫 答案仅供参考，最终决定权在你手中
              </div>
            )}
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

export default AnswerBookPage;
