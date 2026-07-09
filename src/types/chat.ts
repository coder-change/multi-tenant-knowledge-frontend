export interface QaRequest {
  question: string;
  sessionId?: string;
}

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  content: string;
  score: number;
  rerankScore?: number;
  rrfScore?: number;
  chunkIndex: number;
  sourceType?: string;
}

export interface QaResponse {
  answer: string;
  sources: RetrievedChunk[];
  confidence: number;
  latencyMs: number;
}

/** 会话 */
export interface Conversation {
  id: number;
  title: string;
  status: 'ACTIVE' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

/** 流式增量事件 */
export type SseEvent =
  | { type: 'start'; conversationId: number }
  | { type: 'delta'; content: string }
  | { type: 'sources'; sources: RetrievedChunk[] }
  | { type: 'done'; latencyMs: number; totalTokens: number }
  | { type: 'error'; message: string };

/** 会话消息（前端表示） */
export interface ChatMessage {
  id: string;
  conversationId?: number;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
  sources?: RetrievedChunk[];
  latencyMs?: number;
  timestamp: number;
}