import { request } from './request';
import type {
  QaRequest,
  QaResponse,
  Conversation,
  SseEvent,
} from '@/types/chat';

/** 同步问答（保留兼容） */
export const ask = (data: QaRequest): Promise<QaResponse> =>
  request.post('/v1/chat/ask', data);

/** 列出会话 */
export const listConversations = (limit = 20): Promise<Conversation[]> =>
  request.get('/v1/conversations', { params: { limit } });

/** 删除会话 */
export const deleteConversation = (id: number) =>
  request.delete(`/v1/conversations/${id}`);

/** 拉取会话详情（含历史消息） */
export const getConversationMessages = (id: number) =>
  request.get(`/v1/conversations/${id}`);

/**
 * SSE 流式问答。基于 fetch + ReadableStream 自研解析。
 *
 * @param data    请求体 { question, sessionId? }
 * @param onEvent 增量事件回调
 * @param onError 异常回调
 * @param onDone  正常结束回调
 * @returns abort 函数，可用于停止生成
 */
export const askStream = (
  data: QaRequest,
  onEvent: (ev: SseEvent) => void,
  onError?: (err: Error) => void,
  onDone?: () => void,
): (() => void) => {
  const ctrl = new AbortController();

  (async () => {
    try {
      const token = (() => {
        try {
          return JSON.parse(localStorage.getItem('kb-auth') || '{}')?.token || '';
        } catch {
          return '';
        }
      })();

      const resp = await fetch('/api/v1/chat/ask/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ ...data, stream: true }),
        signal: ctrl.signal,
      });

      if (!resp.ok || !resp.body) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const eventText = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          const dataLine = eventText
            .split('\n')
            .find((l) => l.startsWith('data:'));
          if (!dataLine) continue;
          const payload = dataLine.slice(5).trim();

          try {
            const ev = JSON.parse(payload) as SseEvent;
            onEvent(ev);
          } catch {
            // 跳过非 JSON 行
          }
        }
      }
      onDone?.();
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        onError?.(e);
      }
    }
  })();

  return () => ctrl.abort();
};