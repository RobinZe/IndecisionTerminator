/**
 * AI API 配置和调用封装
 * 支持通过环境变量配置不同厂商的API
 */

// API 配置接口
interface AIConfig {
  baseURL: string;
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

// 支持的AI厂商类型
export type AIProvider = 'baidu' | 'openai' | 'ali' | 'tencent' | 'zhipu' | 'custom';

// 获取AI配置
export function getAIConfig(provider: AIProvider = 'baidu'): AIConfig {
  const configs: Record<AIProvider, AIConfig> = {
    baidu: {
      baseURL: import.meta.env.VITE_BAIDU_API_BASE_URL || 'https://api-integrations.appmiaoda.com',
      apiKey: import.meta.env.VITE_BAIDU_API_KEY || import.meta.env.VITE_AI_API_KEY || '',
      model: import.meta.env.VITE_BAIDU_MODEL || 'ernie-4.0',
      maxTokens: parseInt(import.meta.env.VITE_BAIDU_MAX_TOKENS || '4000'),
      temperature: parseFloat(import.meta.env.VITE_BAIDU_TEMPERATURE || '0.7')
    },
    openai: {
      baseURL: import.meta.env.VITE_OPENAI_API_BASE_URL || 'https://api.openai.com/v1',
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS || '4000'),
      temperature: parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE || '0.7')
    },
    ali: {
      baseURL: import.meta.env.VITE_ALI_API_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      apiKey: import.meta.env.VITE_ALI_API_KEY || '',
      model: import.meta.env.VITE_ALI_MODEL || 'qwen-max',
      maxTokens: parseInt(import.meta.env.VITE_ALI_MAX_TOKENS || '4000'),
      temperature: parseFloat(import.meta.env.VITE_ALI_TEMPERATURE || '0.7')
    },
    tencent: {
      baseURL: import.meta.env.VITE_TENCENT_API_BASE_URL || 'https://hunyuan.tencentcloudapi.com/v1',
      apiKey: import.meta.env.VITE_TENCENT_API_KEY || '',
      model: import.meta.env.VITE_TENCENT_MODEL || 'hunyuan-pro',
      maxTokens: parseInt(import.meta.env.VITE_TENCENT_MAX_TOKENS || '4000'),
      temperature: parseFloat(import.meta.env.VITE_TENCENT_TEMPERATURE || '0.7')
    },
    zhipu: {
      baseURL: import.meta.env.VITE_ZHIPU_API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
      apiKey: import.meta.env.VITE_ZHIPU_API_KEY || '',
      model: import.meta.env.VITE_ZHIPU_MODEL || 'glm-4-plus',
      maxTokens: parseInt(import.meta.env.VITE_ZHIPU_MAX_TOKENS || '4000'),
      temperature: parseFloat(import.meta.env.VITE_ZHIPU_TEMPERATURE || '0.7')
    },
    custom: {
      baseURL: import.meta.env.VITE_CUSTOM_API_BASE_URL || '',
      apiKey: import.meta.env.VITE_CUSTOM_API_KEY || '',
      model: import.meta.env.VITE_CUSTOM_MODEL || '',
      maxTokens: parseInt(import.meta.env.VITE_CUSTOM_MAX_TOKENS || '4000'),
      temperature: parseFloat(import.meta.env.VITE_CUSTOM_TEMPERATURE || '0.7')
    }
  };

  const config = configs[provider];
  
  // 检查必要的配置
  if (!config.baseURL || !config.apiKey) {
    console.warn(`AI配置不完整，provider: ${provider}`, config);
  }

  return config;
}

// 获取当前使用的AI厂商
export function getCurrentProvider(): AIProvider {
  return (import.meta.env.VITE_AI_PROVIDER as AIProvider) || 'baidu';
}

// AI服务类
export class AIService {
  private config: AIConfig;
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider || getCurrentProvider();
    this.config = getAIConfig(this.provider);
  }

  // 更新配置
  updateConfig(provider: AIProvider) {
    this.provider = provider;
    this.config = getAIConfig(provider);
  }

  // 发送聊天请求（流式）
  async *sendChatStream(messages: Array<{role: string; content: string}>): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`AI API请求失败: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              console.warn('解析SSE数据失败:', data, e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // 发送聊天请求（非流式）
  async sendChat(messages: Array<{role: string; content: string}>): Promise<string> {
    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`AI API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // 获取配置信息
  getConfig(): AIConfig {
    return { ...this.config };
  }

  // 获取当前厂商
  getProvider(): AIProvider {
    return this.provider;
  }
}

// 创建默认AI服务实例
export const defaultAIService = new AIService();

// 便捷函数
export async function* streamChatResponse(
  messages: Array<{role: string; content: string}>,
  provider?: AIProvider
): AsyncGenerator<string, void, unknown> {
  const service = provider ? new AIService(provider) : defaultAIService;
  yield* service.sendChatStream(messages);
}

export async function getChatResponse(
  messages: Array<{role: string; content: string}>,
  provider?: AIProvider
): Promise<string> {
  const service = provider ? new AIService(provider) : defaultAIService;
  return service.sendChat(messages);
}