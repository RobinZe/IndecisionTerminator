import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, StopCircle, Loader2, MessageCircle } from 'lucide-react';
import { sendChatStream } from '@/utils/chat';
import { useToast } from '@/hooks/use-toast';
import ChatPanel from '@/components/ChatPanel';

const AIAnalysisPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const analysisEndRef = useRef<HTMLDivElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const state = location.state as any;
    if (state?.options && state.options.length > 0) {
      const optionsText = state.options.join('、');
      setInput(`我需要在以下选项中做出选择：${optionsText}\n\n请帮我分析每个选项的优劣势，并给出建议。`);
    }
  }, [location.state]);

  useEffect(() => {
    analysisEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [analysis]);

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
    setAnalysis('');
    abortControllerRef.current = new AbortController();

    const systemPrompt = `你是一个专业的决策分析助手。用户会向你描述他们的选择困难，你需要：
1. 理解用户的具体情况和需求
2. 分析每个选项的优势和劣势
3. 考虑短期和长期影响
4. 提供客观、理性的建议
5. 帮助用户做出更明智的决策

请用清晰、有条理的方式呈现你的分析，包括：
- 问题总结
- 各选项分析
- 综合建议
- 决策要点`;

    try {
      await sendChatStream({
        endpoint: 'https://api-integrations.appmiaoda.com/app-79vic3pdvf9d/api-2bk93oeO9NlE/v2/chat/completions',
        apiId: import.meta.env.VITE_APP_ID,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
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
        },
        signal: abortControllerRef.current.signal
      });
    } catch (error) {
      console.error('发送请求失败:', error);
      setIsAnalyzing(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setInput('');
    setAnalysis('');
  };

  const handleChatAnalysis = (chatAnalysis: any) => {
    if (chatAnalysis.action === 'switch' && chatAnalysis.tool !== 'ai-analysis') {
      const toolPath = `/${chatAnalysis.tool}`;
      navigate(toolPath, { 
        state: {
          options: chatAnalysis.options || [],
          probabilities: chatAnalysis.probabilities || []
        }
      });
    } else if (chatAnalysis.options && chatAnalysis.options.length > 0) {
      const optionsText = chatAnalysis.options.join('、');
      setInput(`我需要在以下选项中做出选择：${optionsText}\n\n请帮我分析每个选项的优劣势，并给出建议。`);
      setAnalysis('');
    }
    setIsChatOpen(false);
  };

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
              AI深度分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">描述您的选择困难</Label>
              <Textarea
                id="question"
                placeholder="例如：我在考虑是否要换工作。目前的工作稳定但发展空间有限，新工作薪资更高但需要搬家..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isAnalyzing}
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2">
              {!isAnalyzing ? (
                <>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!input.trim()}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    开始分析
                  </Button>
                  {analysis && (
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="lg"
                    >
                      重新提问
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  <StopCircle className="w-5 h-5 mr-2" />
                  停止分析
                </Button>
              )}
            </div>

            {(analysis || isAnalyzing) && (
              <div className="space-y-2">
                <Label>AI分析结果</Label>
                <div className="min-h-[200px] max-h-[500px] overflow-y-auto p-4 rounded-lg bg-muted">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-foreground">{analysis}</p>
                    {isAnalyzing && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        分析中...
                      </span>
                    )}
                    <div ref={analysisEndRef} />
                  </div>
                </div>
              </div>
            )}

            {!analysis && !isAnalyzing && (
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">💡 使用提示</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 详细描述您的选择场景和各个选项</li>
                  <li>• 说明您关注的重点因素（如时间、金钱、发展等）</li>
                  <li>• AI会从多个角度为您分析利弊</li>
                  <li>• 分析结果仅供参考，最终决定权在您</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
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
        currentPage="AI分析"
      />
    </div>
  );
};

export default AIAnalysisPage;
