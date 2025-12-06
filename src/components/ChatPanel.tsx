import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import { sendChatStream } from '@/utils/chat';
import { useToast } from '@/hooks/use-toast';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (analysis: any) => void;
  currentPage?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatPanel = ({ isOpen, onClose, onAnalysisComplete, currentPage }: ChatPanelProps) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isAnalyzing) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsAnalyzing(true);

    let systemPrompt = '';
    if (currentPage === 'home') {
      systemPrompt = `你是一个决策辅助智能体。用户会描述他们的选择困难，你需要：
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
- 掷硬币(coin-flip)：恰好2个选项的简单决策
- 掷色子(dice-roll)：2-6个选项的决策
- 概率转盘(wheel)：需要考虑权重的多选项决策，或超过6个选项
- AI分析(ai-analysis)：需要深入分析优劣势的复杂决策
- 答案之书(answer-book)：寻求灵感启发的决策`;
    } else {
      systemPrompt = `你是一个决策辅助智能体。用户正在使用${currentPage}功能，他们可能想要：
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
    }

    let assistantMessage = '';
    abortControllerRef.current = new AbortController();

    try {
      await sendChatStream({
        endpoint: 'https://api-integrations.appmiaoda.com/app-79vic3pdvf9d/api-2bk93oeO9NlE/v2/chat/completions',
        apiId: import.meta.env.VITE_APP_ID,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
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
              setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `已为您分析：${analysis.reasoning}\n\n正在为您准备${getToolName(analysis.tool)}...` 
              }]);
              setTimeout(() => {
                onAnalysisComplete(analysis);
              }, 1000);
            } else {
              throw new Error('无法解析AI响应');
            }
          } catch (error) {
            console.error('解析AI响应失败:', error);
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: '抱歉，我无法理解您的需求。请尝试更清晰地描述您的选择困难。' 
            }]);
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
        },
        signal: abortControllerRef.current.signal
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      setIsAnalyzing(false);
    }
  };

  const getToolName = (tool: string) => {
    const names: Record<string, string> = {
      'coin-flip': '掷硬币',
      'dice-roll': '掷色子',
      'wheel': '概率转盘',
      'ai-analysis': 'AI分析',
      'answer-book': '答案之书'
    };
    return names[tool] || tool;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l-2 border-border shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b-2 border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">智能助手</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>描述您的选择困难</p>
            <p className="text-sm mt-2">我会帮您选择最合适的工具</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isAnalyzing && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-2 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">正在分析...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t-2 border-border">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="描述您的选择困难..."
            disabled={isAnalyzing}
            rows={3}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isAnalyzing}
            size="icon"
            className="bg-primary hover:bg-primary/90 h-auto"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          按 Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
};

export default ChatPanel;
