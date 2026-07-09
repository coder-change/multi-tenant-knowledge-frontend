import { useRef, useCallback, useState } from 'react';
import type { SseEvent } from '@/types/chat';
import { askStream } from '@/api/chat';

interface StreamingChatOptions {
  onEvent: (ev: SseEvent) => void;
  onError?: (err: Error) => void;
  onDone?: () => void;
}

/**
 * 流式聊天 Hook，封装 askStream 提供 React 友好的接口。
 * 返回 { send, abort, isStreaming }。
 */
export const useStreamingChat = (opts: StreamingChatOptions) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<(() => void) | null>(null);

  const send = useCallback(
    (question: string, sessionId?: string) => {
      // 取消上一次
      abortRef.current?.();
      setIsStreaming(true);

      const abort = askStream(
        { question, sessionId },
        (ev) => {
          opts.onEvent(ev);
          if (ev.type === 'done' || ev.type === 'error') {
            setIsStreaming(false);
            abortRef.current = null;
            if (ev.type === 'done') opts.onDone?.();
          }
        },
        (err) => {
          opts.onError?.(err);
          setIsStreaming(false);
          abortRef.current = null;
        },
        () => {
          setIsStreaming(false);
          abortRef.current = null;
          opts.onDone?.();
        },
      );

      abortRef.current = abort;
    },
    [opts],
  );

  const abort = useCallback(() => {
    abortRef.current?.();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  return { send, abort, isStreaming };
};