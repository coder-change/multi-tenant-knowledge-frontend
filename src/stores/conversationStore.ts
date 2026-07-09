import { create } from 'zustand';
import type { Conversation } from '@/types/chat';

interface ConversationState {
  conversations: Conversation[];
  loading: boolean;
  setConversations: (list: Conversation[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  loading: false,
  setConversations: (conversations) => set({ conversations }),
  setLoading: (loading) => set({ loading }),
}));