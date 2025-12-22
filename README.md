# 🎯 选择困难终结者

> AI驱动的智能决策辅助工具，让选择变得简单有趣

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?logo=vite&logoColor=FFD62E)](https://vitejs.dev/)

## 📖 项目介绍

选择困难终结者是一个精心设计的AI驱动决策辅助网站，通过多种趣味化的工具和自然语言交互，帮助用户轻松解决各种选择困难问题。项目完美融合了随机选择算法、AI智能分析和现代UI设计，为用户提供直观、高效、有趣的决策体验。

### ✨ 核心功能

#### 🪙 掷硬币
为硬币的正反面分别指定事件，通过随机选择帮助做出二选一的决定
- 流畅的硬币翻转动画效果
- 自定义正反面事件
- AI自动识别和填充选项

#### 🎲 掷色子  
支持输入2-6个选项，系统自动识别并为色子的6个面分配事件
- 智能解析输入（支持逗号、顿号、换行分隔）
- 自动分配到6个面，支持选项重复分配
- 逼真的色子滚动动画

#### 🎡 概率转盘
自定义多个选项及其对应的概率权重，生成可视化转盘进行选择
- 动态添加/删除选项
- 自定义每个选项的概率（支持归一化）
- 精确的概率计算和指针定位
- 流畅的转盘旋转动画，使用8种低饱和度颜色减少视觉疲劳

#### ✨ AI分析
基于大语言模型，深度分析选择困难的各个方面，提供理性的决策建议
- 智能识别选项和背景
- 优劣势分析
- 流式输出，实时查看分析过程
- 客观中立的建议

#### 📖 答案之书
提供精心设计的50条指导性语句，为用户寻求灵感和启发
- 优雅的翻书动画效果
- 神秘而有趣的体验

## 🤖 AI智能特性

### 智能决策助手
项目集成了AI智能分析功能，能够：
- **自动工具选择**：根据用户输入的问题类型，自动选择最适合的决策工具
- **智能参数填充**：自动从用户描述中提取选项和参数
- **实时交互调整**：支持通过自然语言修改参数或切换工具
- **上下文理解**：理解复杂的决策场景和用户需求

### 工具选择规则
- **掷硬币**：恰好2个选项的简单决策
- **掷色子**：2-6个选项的决策
- **概率转盘**：需要考虑权重的多选项决策，或超过6个选项
- **AI分析**：需要深入分析优劣势的复杂决策
- **答案之书**：寻求灵感启发的决策

## 🛠 技术栈

### 前端技术
- **React 18 + TypeScript** - 现代化前端框架，类型安全
- **Tailwind CSS** - 实用优先的CSS框架，快速响应式设计
- **shadcn/ui** - 基于Radix UI的高质量组件库
- **React Router** - 单页应用路由管理，支持状态传递
- **Vite** - 快速的构建工具和开发服务器

### AI集成
- **多厂商支持** - 百度文心、OpenAI、阿里通义、腾讯混元、智谱AI等
- **流式对话接口** - 实时显示AI分析过程，提升用户体验
- **智能解析** - 自动提取选项、概率权重等关键信息
- **灵活配置** - 通过环境变量配置不同AI厂商的API

### 开发工具
- **Biome** - 代码格式化和质量检查
- **ESLint** - 代码规范检查
- **TypeScript** - 静态类型检查
- **pnpm** - 高效的包管理器

## 🎨 设计理念

### 配色方案
- **主色调**：温暖的橙色（#FF7A3D）- 营造轻松愉悦的氛围
- **辅助色**：清新的蓝绿色（#2EAAA0）- 提供视觉平衡
- **背景色**：柔和的浅色系 - 减轻视觉疲劳
- **整体氛围**：轻松愉悦，减轻决策压力

### 交互设计
- **卡片式设计**：圆润的边角，适度的阴影层次
- **流畅动画**：所有交互都配有平滑的过渡效果
- **响应式布局**：完美适配桌面、平板和移动设备
- **直观操作**：降低使用门槛，提升用户体验

## 🏗 项目结构

```
├── README.md                   # 说明文档
├── components.json              # 组件库配置
├── biome.json                  # 代码格式化配置
├── package.json                # 包管理配置
├── pnpm-lock.yaml             # 锁定依赖版本
├── pnpm-workspace.yaml        # pnpm工作区配置
├── postcss.config.js          # PostCSS配置
├── tailwind.config.js         # Tailwind CSS配置
├── tsconfig.json              # TypeScript配置
├── tsconfig.app.json          # 前端TypeScript配置
├── tsconfig.node.json         # Node.js TypeScript配置
├── vite.config.ts             # Vite构建配置
├── vercel.json                # Vercel部署配置
├── public/                    # 静态资源目录
│   ├── favicon.ico            # 网站图标
│   └── images/                # 图片资源
└── src/                       # 源码目录
    ├── main.tsx               # 应用入口
    ├── App.tsx                # 根组件
    ├── index.css              # 全局样式
    ├── routes.tsx             # 路由配置
    ├── pages/                 # 页面组件
    │   ├── HomePage.tsx       # 主页
    │   ├── CoinFlipPage.tsx   # 掷硬币页面
    │   ├── DiceRollPage.tsx   # 掷色子页面
    │   ├── WheelPage.tsx      # 概率转盘页面
    │   ├── AIAnalysisPage.tsx # AI分析页面
    │   └── AnswerBookPage.tsx # 答案之书页面
    ├── components/            # 组件目录
    │   ├── ui/               # 基础UI组件（shadcn/ui）
    │   └── common/           # 通用业务组件
    ├── hooks/                # 自定义React Hooks
    ├── lib/                  # 工具库
    ├── services/             # API服务层
    ├── utils/                # 工具函数
    └── types/                # TypeScript类型定义
```

## 🚀 快速开始

### 环境要求
- Node.js ≥ 20
- npm ≥ 10 或 pnpm ≥ 8

### 安装和运行

```bash
# 克隆项目
git clone [项目地址]
cd 选择困难终结者

# 安装依赖
npm install
# 或使用 pnpm
pnpm install

# 启动开发服务器
npm run dev
# 或使用 pnpm
pnpm dev

# 访问应用
# 浏览器打开 http://localhost:5173
```

### 构建部署

```bash
# 构建生产版本
npm run build
# 或使用 pnpm
pnpm build

# 预览构建结果
npm run preview
# 或使用 pnpm
pnpm preview
```

## ⚙️ 配置说明

### 环境变量
项目支持多种AI服务配置，复制 `.env.example` 为 `.env` 并配置相应参数：

```env
# 百度文心
BAIDU_API_KEY=your_api_key
BAIDU_SECRET_KEY=your_secret_key

# OpenAI
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=your_base_url

# 其他AI服务...
```

### AI服务支持
- 百度文心一言
- OpenAI GPT系列
- 阿里通义千问
- 腾讯混元
- 智谱AI

## 🌟 项目特色

### 创新点
1. **AI驱动的工具选择**：首次实现决策工具的智能推荐
2. **自然语言交互**：全程支持自然语言描述和调整
3. **精确的概率计算**：确保转盘指针与结果完全一致
4. **统一的设计语言**：所有功能保持一致的交互体验

### 技术亮点
- TypeScript类型安全，提供完整的类型定义
- 组件化架构，易于维护和扩展
- 流式AI响应，减少等待时间
- 优化的动画效果和GPU加速
- 完善的错误处理机制和用户友好的提示

## 📱 部署

### Vercel部署
项目已配置Vercel部署，可直接导入：
1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 自动部署完成

### 其他平台
支持部署到任何支持静态网站的平台：
- Netlify
- GitHub Pages
- 阿里云OSS
- 腾讯云COS

## 🔮 未来规划

### 即将推出的功能
- 🎤 语音输入支持
- 📊 决策历史记录
- 🎯 个性化推荐
- 💬 多轮对话支持
- 📈 决策反馈收集

### 技术演进
- 持续优化AI分析算法
- 增加更多决策工具和场景
- 提升动画效果和交互体验
- 扩展移动端功能

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🤝 贡献

欢迎提交Issue和Pull Request来帮助改进项目！

---

**选择困难终结者** - 让每一个选择都变得轻松愉快 ✨