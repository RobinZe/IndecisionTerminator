import HomePage from './pages/HomePage';
import CoinFlipPage from './pages/CoinFlipPage';
import DiceRollPage from './pages/DiceRollPage';
import WheelPage from './pages/WheelPage';
import AIAnalysisPage from './pages/AIAnalysisPage';
import AnswerBookPage from './pages/AnswerBookPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '首页',
    path: '/',
    element: <HomePage />
  },
  {
    name: '掷硬币',
    path: '/coin-flip',
    element: <CoinFlipPage />
  },
  {
    name: '掷色子',
    path: '/dice-roll',
    element: <DiceRollPage />
  },
  {
    name: '概率转盘',
    path: '/wheel',
    element: <WheelPage />
  },
  {
    name: 'AI分析',
    path: '/ai-analysis',
    element: <AIAnalysisPage />
  },
  {
    name: '答案之书',
    path: '/answer-book',
    element: <AnswerBookPage />
  }
];

export default routes;