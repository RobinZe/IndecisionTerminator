# AI服务配置指南

本项目支持多种AI厂商的API，通过环境变量进行配置，无需修改代码即可切换不同的AI模型提供商。

## 支持的AI厂商

1. **百度文心大模型** (baidu)
2. **OpenAI GPT** (openai)
3. **阿里云通义千问** (ali)
4. **腾讯混元** (tencent)
5. **智谱AI** (zhipu)
6. **自定义API** (custom)

## 快速开始

### 1. 复制环境变量模板

```bash
cp .env.example .env
```

### 2. 选择AI厂商

在 `.env` 文件中设置：

```env
VITE_AI_PROVIDER=baidu
```

### 3. 配置对应的API密钥

根据选择的厂商，配置相应的环境变量：

#### 百度文心大模型

```env
VITE_BAIDU_API_BASE_URL=https://aip.baidubce.com
VITE_BAIDU_API_KEY=your_baidu_api_key_here
VITE_BAIDU_MODEL=ernie-4.0
```

#### OpenAI

```env
VITE_OPENAI_API_BASE_URL=https://api.openai.com/v1
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_OPENAI_MODEL=gpt-4
```

#### 阿里云通义千问

```env
VITE_ALI_API_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
VITE_ALI_API_KEY=your_ali_api_key_here
VITE_ALI_MODEL=qwen-max
```

#### 腾讯混元

```env
VITE_TENCENT_API_BASE_URL=https://hunyuan.tencentcloudapi.com/v1
VITE_TENCENT_API_KEY=your_tencent_api_key_here
VITE_TENCENT_MODEL=hunyuan-pro
```

#### 智谱AI

```env
VITE_ZHIPU_API_BASE_URL=https://open.bigmodel.cn/api/paas/v4
VITE_ZHIPU_API_KEY=your_zhipu_api_key_here
VITE_ZHIPU_MODEL=glm-4-plus
```

#### 自定义API

```env
VITE_CUSTOM_API_BASE_URL=https://your-custom-api.com/v1
VITE_CUSTOM_API_KEY=your_custom_api_key_here
VITE_CUSTOM_MODEL=your-custom-model
```

## 环境变量详细说明

### 通用配置

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `VITE_AI_PROVIDER` | 选择AI厂商 | baidu | 是 |
| `VITE_AI_API_KEY` | 备用API密钥 | - | 否 |

### 百度文心配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_BAIDU_API_BASE_URL` | API基础URL | `https://aip.baidubce.com` |
| `VITE_BAIDU_API_KEY` | API密钥 | - |
| `VITE_BAIDU_MODEL` | 模型名称 | `ernie-4.0` |
| `VITE_BAIDU_MAX_TOKENS` | 最大令牌数 | `4000` |
| `VITE_BAIDU_TEMPERATURE` | 温度参数 | `0.7` |

### OpenAI配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_OPENAI_API_BASE_URL` | API基础URL | `https://api.openai.com/v1` |
| `VITE_OPENAI_API_KEY` | API密钥 | - |
| `VITE_OPENAI_MODEL` | 模型名称 | `gpt-4` |
| `VITE_OPENAI_MAX_TOKENS` | 最大令牌数 | `4000` |
| `VITE_OPENAI_TEMPERATURE` | 温度参数 | `0.7` |

### 阿里云通义千问配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_ALI_API_BASE_URL` | API基础URL | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `VITE_ALI_API_KEY` | API密钥 | - |
| `VITE_ALI_MODEL` | 模型名称 | `qwen-max` |
| `VITE_ALI_MAX_TOKENS` | 最大令牌数 | `4000` |
| `VITE_ALI_TEMPERATURE` | 温度参数 | `0.7` |

### 腾讯混元配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_TENCENT_API_BASE_URL` | API基础URL | `https://hunyuan.tencentcloudapi.com/v1` |
| `VITE_TENCENT_API_KEY` | API密钥 | - |
| `VITE_TENCENT_MODEL` | 模型名称 | `hunyuan-pro` |
| `VITE_TENCENT_MAX_TOKENS` | 最大令牌数 | `4000` |
| `VITE_TENCENT_TEMPERATURE` | 温度参数 | `0.7` |

### 智谱AI配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_ZHIPU_API_BASE_URL` | API基础URL | `https://open.bigmodel.cn/api/paas/v4` |
| `VITE_ZHIPU_API_KEY` | API密钥 | - |
| `VITE_ZHIPU_MODEL` | 模型名称 | `glm-4-plus` |
| `VITE_ZHIPU_MAX_TOKENS` | 最大令牌数 | `4000` |
| `VITE_ZHIPU_TEMPERATURE` | 温度参数 | `0.7` |

### 自定义API配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_CUSTOM_API_BASE_URL` | API基础URL | - |
| `VITE_CUSTOM_API_KEY` | API密钥 | - |
| `VITE_CUSTOM_MODEL` | 模型名称 | - |
| `VITE_CUSTOM_MAX_TOKENS` | 最大令牌数 | `4000` |
| `VITE_CUSTOM_TEMPERATURE` | 温度参数 | `0.7` |

## 在代码中使用

### 1. 使用默认配置

```typescript
import { defaultAIService } from '@/services/aiService';

// 使用当前环境配置的AI服务
const response = await defaultAIService.sendChatStream(messages);
```

### 2. 指定特定厂商

```typescript
import { AIService } from '@/services/aiService';

// 创建指定厂商的AI服务实例
const service = new AIService('openai');
const response = await service.sendChatStream(messages);
```

### 3. 动态切换厂商

```typescript
import { defaultAIService } from '@/services/aiService';

// 动态切换到OpenAI
defaultAIService.updateConfig('openai');
```

## Vercel部署配置

在Vercel中设置环境变量：

1. 进入项目设置
2. 找到"Environment Variables"
3. 添加上述环境变量
4. 重新部署项目

### Vercel环境变量示例

```
VITE_AI_PROVIDER=baidu
VITE_BAIDU_API_KEY=your_production_baidu_api_key
VITE_BAIDU_MODEL=ernie-4.0
```

或使用智谱AI：

```
VITE_AI_PROVIDER=zhipu
VITE_ZHIPU_API_KEY=your_production_zhipu_api_key
VITE_ZHIPU_MODEL=glm-4-plus
```

## 向后兼容

为了保持向后兼容，原有的配置方式仍然有效：

```env
VITE_APP_ID=app-79vic3pdvf9d
```

如果同时配置了新系统和旧系统的环境变量，新系统优先。

## 故障排除

### 1. API密钥未生效

- 确认环境变量名正确（以`VITE_`开头）
- 重启开发服务器或重新部署
- 检查Vite配置是否正确加载环境变量

### 2. 切换厂商后无响应

- 检查对应厂商的API密钥是否正确
- 确认API基础URL是否可访问
- 查看浏览器控制台的错误信息

### 3. 模型不存在

- 确认模型名称拼写正确
- 检查当前API密钥是否有权限使用该模型
- 参考对应厂商的官方文档

## 安全建议

1. **不要提交API密钥到版本控制系统**
2. **使用强密码作为API密钥**
3. **定期更换API密钥**
4. **为不同环境使用不同的API密钥**
5. **监控API使用量和费用**

## API密钥获取

### 百度文心大模型
- 访问 [百度智能云](https://cloud.baidu.com/)
- 开通千帆大模型平台服务
- 获取API Key

### OpenAI
- 访问 [OpenAI Platform](https://platform.openai.com/)
- 创建API Key
- 确保账户有足够额度

### 阿里云通义千问
- 访问 [阿里云控制台](https://dashscope.console.aliyun.com/)
- 开通DashScope服务
- 获取API-KEY

### 腾讯混元
- 访问 [腾讯云控制台](https://console.cloud.tencent.com/)
- 开通混元大模型服务
- 获取Secret ID和Secret Key

### 智谱AI
- 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
- 注册并登录账户
- 获取API Key
- 确保账户有足够额度