# 项目结构与技术栈说明

本文件梳理仓库整体结构、各文件/目录的作用，以及项目用于部署网站所采用的技术栈与思路，帮助开发者快速理解并上手维护。

---

## 一、项目概览

- 项目名称：选择困难终结者（React + TypeScript 前端应用）
- 功能定位：面向“选择困难症”的辅助工具页面集合（掷骰、转盘、硬币、答案书等），并预留了鉴权、上传、AI 分析等扩展能力
- 主要技术：Vite、React 18、TypeScript、Tailwind CSS、shadcn/ui、Radix UI、React Router、Supabase

相关参考：
- docs/FEATURES.md：功能与技术说明
- README.md：技术栈与目录结构简述

---

## 二、目录结构与文件作用说明

以下基于当前仓库实际文件列出重点内容（仅列举关键节点，未出现的文件说明以 README 为准或可能已废弃）：

### 根目录（/）
- .env：环境变量配置文件（例如 Supabase 项目 url/key、站点运行环境等）。请勿提交敏感信息到版本库。
- .gitignore：Git 忽略规则，避免构建产物、环境文件等被提交。
- README.md：项目说明文档，含目录结构、技术栈与本地开发提示。
- biome.json：Biome（代码质量/格式检查）配置文件。
- components.json：shadcn/ui 组件库配置，用于管理生成/引入的 UI 组件。
- docs/：项目文档目录（如需求/功能说明等）。
  - FEATURES.md：功能与技术说明。
  - prd.md：产品需求文档。
- index.html：Vite 应用入口 HTML 文件（根挂载点，页面元信息等）。
- package.json：项目依赖与脚本管理文件。
  - scripts：当前 dev/build 为占位提示，强调“仅使用 lint 检查”；真正的开发/构建流程需结合 Vite 配置与 pnpm 命令安排（见下文）。
  - dependencies/devDependencies：列出运行时与开发时依赖（React、Router、Tailwind、Vite、Biome、SVGR、TypeScript 等）。
- pnpm-lock.yaml：pnpm 依赖锁定文件，确保一致的依赖版本。
- pnpm-workspace.yaml：pnpm 工作空间配置（即便当前是单包项目，仍可用于协同与统一依赖管理）。
- postcss.config.js：PostCSS 配置文件（Tailwind 与 Autoprefixer 等处理）。
- public/：静态资源目录（favicon、图片等），在构建时原样复制到产物目录。
- rules/：项目规则/脚本目录。
  - SelectItem.yml：自定义规则配置（可能用于质量门禁或校验）。
  - check.sh：lint 脚本中调用的检查脚本（配合 Biome 和 tsgo 使用）。
- sgconfig.yml：项目规则/质量门禁相关的扩展配置（具体用途依配置而定）。
- tailwind.config.js：Tailwind CSS 配置（主题、插件、扫描路径等）。
- tsconfig*.json：TypeScript 配置文件（前端、Node、检查配置等划分）。
  - tsconfig.json / tsconfig.app.json / tsconfig.node.json / tsconfig.check.json：分别用于通用、前端应用、Node 相关与专用“检查”场景的编译选项。
- vite.config.ts / vite.config.dev.ts：Vite 主配置与开发变体（插件、别名、构建优化等）。

### 源码目录（/src）
- main.tsx：前端应用入口文件，挂载 React 应用到 index.html 指定的元素。
- App.tsx：应用根组件。
  - 使用 React Router（BrowserRouter、Routes、Route、Navigate），集中路由渲染。
  - 可按需接入鉴权方案（如 Supabase Auth），并为需要保护的路由添加白名单配置。
- routes.tsx：路由配置集中定义，导出 routes，App.tsx 中消费。
- index.css：全局样式入口（Tailwind 初始化、全局变量、通用样式）。
- global.d.ts / svg.d.ts / vite-env.d.ts：类型声明文件（全局类型扩展、SVG 模块导入、Vite 环境类型）。

- components/：组件目录
  - common/：通用组件（如头部 Header 等，当前可能为空或待扩展）。
  - ui/：shadcn/ui 风格组件的放置目录。
  - dropzone.tsx：文件拖拽/选择的 UI 组件，与上传逻辑（hooks）配合使用。

- hooks/：通用钩子函数目录
  - use-debounce.ts：防抖逻辑封装，在频繁触发事件时减少计算与渲染。
  - use-go-back.ts：封装返回上一页的导航逻辑（基于 history / Router）。
  - use-mobile.ts：移动端检测/适配相关逻辑。
  - use-supabase-upload.ts：文件上传到 Supabase Storage 的通用逻辑封装（见下文“关键逻辑”）。
  - use-toast.tsx：消息提示封装（可能基于 sonner/shadcn Toast）。

- lib/
  - utils.ts：通用工具（如类名合并、格式化函数等）。

- pages/：页面目录（功能页面集合）
  - HomePage.tsx：主页。
  - AIAnalysisPage.tsx：AI 分析相关页面（配合 utils/chat.ts 或服务端接口）。
  - AnswerBookPage.tsx：答案书页面。
  - CoinFlipPage.tsx：掷硬币页面。
  - DiceRollPage.tsx：掷骰子页面。
  - WheelPage.tsx：转盘页面。
  - SamplePage.tsx：示例页面。
  - NotFound.tsx：404 页面。

- services/
  - .keep：目录占位符，用于未来数据访问层（请求封装、Supabase/后端交互）。

- types/
  - index.ts：类型集中定义与导出。

- utils/
  - chat.ts：聊天/AI 请求相关工具函数（例如流式输出、消息处理等）。

#### 关键逻辑：use-supabase-upload.ts
该 Hook 负责整合 react-dropzone 与 Supabase Storage 上传：
- 接收配置（bucketName、path、allowedMimeTypes、maxFileSize、maxFiles、cacheControl、upsert、supabase 客户端）
- 维护 files / loading / errors / successes 等状态，并计算 isSuccess
- 使用 useDropzone 管理拖拽与文件选择，处理合法/非法文件、预览 URL 与校验错误
- onUpload：将待上传文件批量上传到 Supabase 指定 bucket/path，并收集/合并错误与成功状态，以支持“部分成功”的重试
- useEffect：当文件数变化时清理错误或移除“过多文件”等校验错误

开发者可在页面与组件中：
- 将 supabase 客户端以 props 传入该 Hook
- 将 dropzoneProps 与文件列表渲染在 UI 层（如 components/dropzone.tsx）
- 调用 onUpload 完成上传，并在成功/失败后给出提示（use-toast.tsx）

---

## 三、依赖与工具（简要）

- 前端框架：React 18（react、react-dom）
- 路由：react-router、react-router-dom（App 与 routes.tsx 已集成）
- 语言与类型：TypeScript（tsconfig* 多配置拆分）；@types/react / @types/react-dom / 等
- 构建工具：Vite（vite.config.ts / vite.config.dev.ts）；@vitejs/plugin-react
- 样式系统：Tailwind CSS（tailwind.config.js、postcss.config.js、index.css）；tailwind-merge、tailwindcss-animate
- UI 组件：shadcn/ui（components.json）、Radix UI 系列组件
- 图标与交互：lucide-react、cmdk、vaul 等
- 上传与存储：@supabase/supabase-js（Storage 上传）、react-dropzone（拖拽）
- 反馈与交互：sonner（Toast 通知）
- 可视化：recharts
- 其它：
  - vite-plugin-svgr：将 SVG 以 React 组件方式导入使用
  - date-fns：日期工具
  - axios/ky：HTTP 客户端
  - embla-carousel-react：轮播组件
  - zod：数据校验
  - Biome：代码质量与风格检查（通过 lint 脚本调用）

---

## 四、开发与构建流程说明

- 当前 package.json 中：
  - dev/build 脚本被占位为提示语（"Do not use this command, only use lint to check"），说明本仓库将“代码检查”置于高优先级；实际开发与构建需结合 Vite、pnpm 与项目自定义流程执行。
  - lint 脚本：`tsgo -p tsconfig.check.json; npx biome lint; rules/check.sh`，包含类型检查（tsgo）、Biome Lint 与自定义规则脚本。
- 常规 Vite 项目实践：
  - 开发：使用 Vite 开发服务器（vite 或使用 pnpm script 封装），结合 vite.config.dev.ts 进行调试。
  - 构建：`vite build` 产出静态资源（HTML/CSS/JS）至 dist 目录（当前未显式包含 dist，需按环境执行）。
- 依赖管理：pnpm（配合 pnpm-workspace.yaml），提升安装速度与一致性。

提示：如需添加标准 dev/build 脚本，可结合 vite/ts 环境在 package.json 中新增，例如：
- "dev": "vite"
- "build": "vite build"
- "preview": "vite preview"
请按团队规范调整。

---

## 五、部署与技术栈分析（网站上线）

本项目为典型的“前端静态站点 + 可选后端服务”架构：

1) 前端构建与部署
- 使用 Vite 将 React + TypeScript 应用构建为静态产物（HTML/CSS/JS）。
- 样式由 Tailwind CSS 处理（配合 PostCSS），UI 由 shadcn/ui + Radix UI 提供组件基础。
- 部署平台选择：仓库内未提供特定托管平台配置，可选择如下常见平台：
  - Vercel：零配置部署 Vite 前端，适合快速上线与预览。
  - Netlify：支持静态站点与 Edge 功能，自动化构建与发布。
  - Cloudflare Pages：静态产物托管，全球加速。
  - Supabase Storage + 自有 CDN/静态服务器：直接托管静态资源（若希望与 Supabase 后端统一管理）。
  - 传统 Nginx/Apache：将 dist 产物放置于服务器并配置静态路径。
- 环境变量：通过 .env 文件在构建/运行时注入，例如 API 地址、Supabase 项目信息。

2) 后端服务与数据能力（可选/拓展）
- Supabase：
  - 鉴权：可基于 Supabase Auth 或其他方案实现登录保护与白名单路由。
  - 存储：use-supabase-upload.ts 已集成 Supabase Storage 上传逻辑，支持缓存控制、覆盖（upsert）与多文件选择。
  - 数据库：README 提示可使用 Supabase 官方版本或自部署开源版本，结合 services/ 目录未来接入。

3) 运行与质量保障
- Biome + 自定义规则脚本（rules/check.sh）确保一致的代码质量与风格。
- TypeScript 多环境配置（tsconfig.*）保证类型安全与不同运行场景的优化。
- vite-plugin-svgr、class-variance-authority、tailwind-merge 等提升工程效率与可维护性。

结论：
- 部署维度的核心技术栈：Vite（构建/打包）、pnpm（依赖/CI）、Tailwind（样式）、React Router（路由）、shadcn/Radix（UI）、Supabase（鉴权/存储/后端能力）。
- 仓库未绑定某个固定托管平台，可按团队偏好选择 Vercel/Netlify/Cloudflare Pages/Supabase/Nginx 等，将 Vite 构建产物直接上线。

---

## 六、维护与扩展建议

- 脚本补全：根据团队需要在 package.json 中补全 dev/build/preview，统一开发启动方式。
- 环境管理：将 .env 分环境拆分（.env.development / .env.production），并在 Vite 配置中按需加载。
- 服务抽象：在 services/ 目录补全 API 封装，统一错误处理、鉴权与缓存策略。
- 组件规范：通过 components.json 与 shadcn/ui 生成/维护组件，结合 Radix UI 保持一致的交互语义与可访问性。
- 质量保障：持续使用 Biome 与规则脚本，结合 CI（GitHub Actions/其他）自动执行 lint 与构建。

---

## 七、快速索引

- 入口：index.html、src/main.tsx、src/App.tsx
- 路由：src/routes.tsx、src/pages/*
- 样式：src/index.css、tailwind.config.js、postcss.config.js
- 组件：src/components/*（含 ui/ 与 common/）
- 钩子：src/hooks/*（重点：use-supabase-upload.ts）
- 类型：src/types/*、src/global.d.ts、src/svg.d.ts、src/vite-env.d.ts
- 工具：src/lib/utils.ts、src/utils/chat.ts
- 构建：vite.config.ts / vite.config.dev.ts、tsconfig*.json、package.json
- 资源：public/*
- 文档：docs/*（本文件、FEATURES.md、prd.md）