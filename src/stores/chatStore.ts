import { create } from 'zustand';
import type { ChatMessage, RetrievedChunk, Conversation } from '@/types/chat';

interface ChatState {
  // 会话
  conversations: Conversation[];
  currentConversationId: number | null;

  // 消息
  messages: ChatMessage[];
  currentSources: RetrievedChunk[];

  // 流式状态
  streamingMessageId: string | null;
  abortFn: (() => void) | null;

  setConversations: (list: Conversation[]) => void;
  setCurrentConversationId: (id: number | null) => void;
  addConversation: (c: Conversation) => void;
  removeConversation: (id: number) => void;

  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  patchMessage: (id: string, patch: Partial<ChatMessage>) => void;
  finishMessage: (id: string, sources: RetrievedChunk[], latencyMs: number) => void;
  setCurrentSources: (sources: RetrievedChunk[]) => void;
  setStreamingMessage: (id: string | null, abort: (() => void) | null) => void;
  clearMessages: () => void;
  loadMessages: (msgs: ChatMessage[]) => void;
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  currentConversationId: null,
  messages: [],
  currentSources: [],
  streamingMessageId: null,
  abortFn: null,

  setConversations: (list) => set({ conversations: list }),
  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  addConversation: (c) =>
    set((s) => ({ conversations: [c, ...s.conversations] })),
  removeConversation: (id) =>
    set((s) => ({
      conversations: s.conversations.filter((c) => c.id !== id),
      ...(s.currentConversationId === id && { messages: [], currentSources: [] }),
    })),

  addMessage: (msg) => {
    const id = newId();
    set((s) => ({
      messages: [
        ...s.messages,
        { id, timestamp: Date.now(), ...msg },
      ].slice(-200),
    }));
    return id;
  },

  patchMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      ),
    })),

  finishMessage: (id, sources, latencyMs) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id
          ? { ...m, streaming: false, sources, latencyMs }
          : m,
      ),
      currentSources: sources,
      streamingMessageId: null,
      abortFn: null,
    })),

  setCurrentSources: (sources) => set({ currentSources: sources }),
  setStreamingMessage: (streamingMessageId, abortFn) =>
    set({ streamingMessageId, abortFn }),

  clearMessages: () =>
    set({ messages: [], currentSources: [], streamingMessageId: null, abortFn: null }),

  loadMessages: (msgs) => set({ messages: msgs }),
}));