import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import ChatPanel from '@/components/ChatPanel';

const CoinFlipPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [heads, setHeads] = useState('');
  const [tails, setTails] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  const handleChatAnalysis = (analysis: any) => {
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
    }
    setIsChatOpen(false);
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
        currentPage="掷硬币"
      />
    </div>
  );
};

export default CoinFlipPage;
