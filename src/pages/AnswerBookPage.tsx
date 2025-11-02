import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

const AnswerBookPage = () => {
  const navigate = useNavigate();
  const [answer, setAnswer] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const answers = [
    '是的，现在就去做吧',
    '不，这不是最好的时机',
    '相信你的直觉',
    '再等等，时机未到',
    '大胆去尝试',
    '保持耐心，答案会自然显现',
    '这是一个好主意',
    '重新考虑你的选择',
    '跟随你的内心',
    '寻求他人的建议',
    '现在行动会带来好结果',
    '暂时放下，过段时间再看',
    '你已经知道答案了',
    '改变是必要的',
    '坚持你的立场',
    '尝试不同的方法',
    '答案就在你心中',
    '勇敢迈出第一步',
    '保持开放的心态',
    '相信过程',
    '这需要更多思考',
    '机会就在眼前',
    '倾听内心的声音',
    '顺其自然',
    '做让你快乐的选择',
    '不要害怕改变',
    '相信自己的判断',
    '现在是最好的时机',
    '给自己更多时间',
    '跟随你的热情',
    '保持乐观',
    '这是正确的方向',
    '重新审视你的目标',
    '相信一切都会好起来',
    '勇敢面对挑战',
    '保持冷静和理智',
    '这个选择会带来成长',
    '倾听你的理性',
    '现在还不是时候',
    '准备好了就去做',
    '相信命运的安排',
    '做真实的自己',
    '这需要勇气',
    '保持信念',
    '答案比你想象的更简单',
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
    </div>
  );
};

export default AnswerBookPage;
