import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendChatStream } from '@/utils/chat';

const AIAnalysisPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isChatAnalyzing, setIsChatAnalyzing] = useState(false);

  useEffect(() => {
    const state = location.state as any;
    if (state?.question) {
      setQuestion(state.question);
    }
  }, [location.state]);

  const handleAnalyze = async () => {
    if (!question.trim()) {
      toast({
        title: '请输入问题',
        description: '请描述您的选择困难',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis('');

    const systemPrompt = `你是一个专业的决策分析助手。用户会向你描述他们的选择困难，请你：
1. 分析各个选项的优劣势
2. 考虑短期和长期影响
3. 提供客观的建议
4. 给出明确的推荐

请用清晰、结构化的方式回答，包含：
- 问题分析
- 各选项优劣
- 综合建议
- 最终推荐`;

    try {
      await sendChatStream({
        endpoint: 'https://api-integrations.appmiaoda.com/app-79vic3pdvf9d/api-2bk93oeO9NlE/v2/chat/completions',
        apiId: import.meta.env.VITE_APP_ID,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        onUpdate: (content: string) => {
          setAnalysis(content);
        },
        onComplete: () => {
          setIsAnalyzing(false);
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

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatAnalyzing) return;

    const userInput = chatInput.trim();
    setChatInput('');
    setIsChatAnalyzing(true);

    const systemPrompt = `你是一个决策辅助智能体。用户正在使用AI分析功能，他们可能想要：
1. 修改当前问题
2. 切换到其他功能

请严格按照以下JSON格式返回，不要有任何其他文字：
{
  "action": "modify|switch",
  "tool": "coin-flip|dice-roll|wheel|ai-analysis|answer-book",
  "options": ["选项1", "选项2", ...],
  "probabilities": [50, 50, ...],
  "question": "新的问题",
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
          setIsChatAnalyzing(false);
          try {
            const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const analysisResult = JSON.parse(jsonMatch[0]);
              
              if (analysisResult.action === 'switch' && analysisResult.tool !== 'ai-analysis') {
                const toolPath = `/${analysisResult.tool}`;
                navigate(toolPath, { 
                  state: {
                    options: analysisResult.options || [],
                    probabilities: analysisResult.probabilities || []
                  }
                });
              } else if (analysisResult.question) {
                setQuestion(analysisResult.question);
                setAnalysis('');
                toast({
                  title: '问题已更新',
                  description: analysisResult.reasoning
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
          setIsChatAnalyzing(false);
          toast({
            title: 'AI分析失败',
            description: '请稍后重试',
            variant: 'destructive'
          });
        }
      });
    } catch (error) {
      console.error('发送请求失败:', error);
      setIsChatAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 pb-32">
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
            <CardTitle className="text-3xl text-center gradient-text flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8" />
              AI深度分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Textarea
                placeholder="请详细描述您的选择困难，包括各个选项和您的考虑因素..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isAnalyzing}
                rows={6}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!question.trim() || isAnalyzing}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  AI分析中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  开始分析
                </>
              )}
            </Button>

            {analysis && (
              <div className="mt-6 p-6 bg-muted rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-primary font-bold text-lg">
                  <Sparkles className="w-5 h-5" />
                  AI分析结果
                </div>
                <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                  {analysis}
                </div>
              </div>
            )}

            {analysis && !isAnalyzing && (
              <div className="text-center text-sm text-muted-foreground">
                💡 以上分析仅供参考，最终决定权在您手中
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
            disabled={isChatAnalyzing}
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
            disabled={!chatInput.trim() || isChatAnalyzing}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            {isChatAnalyzing ? (
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

export default AIAnalysisPage;
