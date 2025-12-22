/**
 * 聊天相关工具函数
 * 使用新的AI服务封装
 */

import ky, { type KyResponse, type AfterResponseHook, type NormalizedOptions } from 'ky';
import {
  createParser,
  type EventSourceParser
} from 'eventsource-parser';
import { streamChatResponse, defaultAIService, type AIProvider } from '../services/aiService';

export interface SSEOptions {
  onData: (data: string) => void;
  onEvent?: (event: any) => void;
  onCompleted?: (error?: Error) => void;
  onAborted?: () => void;
  onReconnectInterval?: (interval: number) => void;
}

export const createSSEHook = (options: SSEOptions): AfterResponseHook => {
  const hook: AfterResponseHook = async (request: Request, _options: NormalizedOptions, response: KyResponse) => {
    if (!response.ok || !response.body) {
      return;
    }

    let completed = false;
    const innerOnCompleted = (error?: Error): void => {
      if (completed) {
        return;
      }

      completed = true;
      options.onCompleted?.(error);
    };

    const isAborted = false;

    const reader: ReadableStreamDefaultReader<Uint8Array> = response.body.getReader();

    const decoder: TextDecoder = new TextDecoder('utf8');

    const parser: EventSourceParser = createParser({
      onEvent: (event) => {
        if (event.data) {
          options.onEvent?.(event);
          const dataArray: string[] = event.data.split('\\ ');
          for (const data of dataArray) {
            options.onData(data);
          }
        }
      }
    });

    const read = (): void => {
      if (isAborted) {
        return;
      }

      reader.read().then((result: ReadableStreamReadResult<Uint8Array>) => {
        if (result.done) {
          innerOnCompleted();
          return;
        }

        parser.feed(decoder.decode(result.value, { stream: true }));

        read();
      }).catch(error => {
        if (request.signal.aborted) {
          options.onAborted?.();
          return;
        }

        innerOnCompleted(error as Error);
      });
    };

    read();

    return response;
  };

  return hook;
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
}

export interface ChatStreamOptions {
  endpoint?: string; // 保持向后兼容，但现在可选
  messages: ChatMessage[];
  apiId?: string; // 保持向后兼容，但现在可选
  onUpdate: (content: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
  signal?: AbortSignal;
  provider?: AIProvider; // 新增：AI厂商选择
}

// 新的流式聊天实现，使用AI服务封装
export const sendChatStreamNew = async (options: ChatStreamOptions): Promise<void> => {
  const { messages, onUpdate, onComplete, onError, signal, provider } = options;
  
  let currentContent = '';

  try {
    const stream = provider 
      ? streamChatResponse(messages.map(msg => ({ role: msg.role, content: msg.content })), provider)
      : defaultAIService.sendChatStream(messages.map(msg => ({ role: msg.role, content: msg.content })));

    for await (const chunk of stream) {
      if (signal?.aborted) {
        break;
      }
      currentContent += chunk;
      onUpdate(currentContent);
    }

    if (!signal?.aborted) {
      onComplete();
    }
  } catch (error) {
    if (!signal?.aborted) {
      onError(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
};

// 保持原有接口向后兼容，但内部使用新的实现
export const sendChatStream = async (options: ChatStreamOptions): Promise<void> => {
  // 如果提供了传统的endpoint和apiId，使用旧的方式（向后兼容）
  if (options.endpoint && options.apiId) {
    const { messages, onUpdate, onComplete, onError, signal } = options;

    let currentContent = '';

    const sseHook = createSSEHook({
      onData: (data: string) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.choices?.[0]?.delta?.content) {
            currentContent += parsed.choices[0].delta.content;
            onUpdate(currentContent);
          }
        } catch {
          console.warn('Failed to parse SSE data:', data);
        }
      },
      onCompleted: (error?: Error) => {
        if (error) {
          onError(error);
        } else {
          onComplete();
        }
      },
      onAborted: () => {
        console.log('Stream aborted');
      }
    });

    try {
      await ky.post(options.endpoint, {
        json: {
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          enable_thinking: false
        },
        headers: {
          'X-App-Id': options.apiId,
          'Content-Type': 'application/json'
        },
        signal,
        hooks: {
          afterResponse: [sseHook]
        }
      });
    } catch (error) {
      if (!signal?.aborted) {
        onError(error as Error);
      }
    }
  } else {
    // 使用新的AI服务实现
    await sendChatStreamNew(options);
  }
};