import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendChatStream } from '@/utils/chat';

const AIAnalysisPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleAnalyze = async () => {
    if (!question.trim()) {
      toast({
        title: '请输入问题',
        description: '请描述你需要帮助决策的问题',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis('');
    abortControllerRef.current = new AbortController();

    const systemPrompt = '你是一个专业的决策分析助手。用户会向你描述他们面临的选择困难，你需要：1. 理解用户的选择场景 2. 分析各个选项的优劣势 3. 从理性角度给出建议 4. 保持客观中立，最终决定权在用户。请用简洁清晰的语言回答，分点说明。';

    try {
      await sendChatStream({
        endpoint: 'https://api-integrations.appmiaoda.com/app-79vic3pdvf9d/api-2bk93oeO9NlE/v2/chat/completions',
        apiId: import.meta.env.VITE_APP_ID,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: question
          }
        ],
        onUpdate: (content: string) => {
          setAnalysis(content);
        },
        onComplete: () => {
          setIsAnalyzing(false);
        },
        onError: (error: Error) => {
          console.error('AI分析错误:', error);
          toast({
            title: 'AI分析失败',
            description: '请稍后重试',
            variant: 'destructive'
          });
          setIsAnalyzing(false);
        },
        signal: abortControllerRef.current.signal
      });
    } catch (error) {
      console.error('AI分析错误:', error);
      if (!abortControllerRef.current?.signal.aborted) {
        toast({
          title: 'AI分析失败',
          description: '请稍后重试',
          variant: 'destructive'
        });
      }
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
    setQuestion('');
    setAnalysis('');
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
            <CardTitle className="text-3xl text-center gradient-text flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8" />
              AI分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">描述你的选择困难</Label>
              <Textarea
                id="question"
                placeholder="例如：我在考虑是否要换工作。现在的工作稳定但发展空间有限，新工作薪资更高但需要搬到另一个城市。我该如何选择？"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={isAnalyzing}
                rows={6}
                className="resize-none"
              />
            </div>

            {analysis && (
              <div className="space-y-2">
                <Label>AI分析结果</Label>
                <div className="p-4 rounded-lg bg-muted border-2 border-border min-h-[200px]">
                  <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                    {analysis}
                  </div>
                  {isAnalyzing && (
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">AI正在分析中...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {!isAnalyzing ? (
                <>
                  <Button
                    onClick={handleAnalyze}
                    disabled={!question.trim()}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
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
                  停止分析
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground text-center">
              💡 提示：描述得越详细，AI的分析会越准确
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAnalysisPage;
