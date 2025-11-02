import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Dices, CircleDot, Sparkles, BookOpen } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const modes = [
    {
      id: 'coin-flip',
      title: '掷硬币',
      description: '为正反面指定事件，随机选择结果',
      icon: Coins,
      path: '/coin-flip',
      gradient: 'from-primary to-primary-glow'
    },
    {
      id: 'dice-roll',
      title: '掷色子',
      description: '语音或文字输入事件，系统识别并随机选择',
      icon: Dices,
      path: '/dice-roll',
      gradient: 'from-secondary to-accent'
    },
    {
      id: 'wheel',
      title: '概率转盘',
      description: '自定义条目和概率，生成转盘进行选择',
      icon: CircleDot,
      path: '/wheel',
      gradient: 'from-chart-3 to-chart-1'
    },
    {
      id: 'ai-analysis',
      title: 'AI分析',
      description: '智能分析各种情况，提供选择建议',
      icon: Sparkles,
      path: '/ai-analysis',
      gradient: 'from-chart-4 to-chart-5'
    },
    {
      id: 'answer-book',
      title: '答案之书',
      description: '随机显示指导性语句帮助决策',
      icon: BookOpen,
      path: '/answer-book',
      gradient: 'from-primary to-secondary'
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 gradient-text">
            选择困难症终结者
          </h1>
          <p className="text-xl text-muted-foreground">
            让决策变得简单有趣，告别选择困难
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Card
                key={mode.id}
                className="card-hover cursor-pointer border-2 overflow-hidden"
                onClick={() => navigate(mode.path)}
              >
                <CardContent className="p-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-foreground">
                    {mode.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {mode.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            选择一个模式开始你的决策之旅
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
