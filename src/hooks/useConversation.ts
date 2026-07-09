import { useEffect, useCallback } from 'react';
import { message as antdMsg } from 'antd';
import { listConversations, deleteConversation } from '@/api/chat';
import { useConversationStore } from '@/stores/conversationStore';
import { useChatStore } from '@/stores/chatStore';

/**
 * 会话列表 Hook
 * - 自动加载会话列表
 * - 提供 select / remove / create / refresh 方法
 */
export const useConversation = () => {
  const { conversations, loading, setConversations, setLoading } =
    useConversationStore();
  const currentId = useChatStore((s) => s.currentConversationId);
  const setId = useChatStore((s) => s.setCurrentConversationId);
  const addConv = useChatStore((s) => s.addConversation);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listConversations(50);
      setConversations(list);
    } catch {
      // 拦截器已处理
    } finally {
      setLoading(false);
    }
  }, [setConversations, setLoading]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const select = useCallback(
    (id: number) => {
      setId(id);
    },
    [setId],
  );

  const remove = useCallback(
    async (id: number) => {
      try {
        await deleteConversation(id);
        antdMsg.success('会话已删除');
        if (currentId === id) setId(null);
        refresh();
      } catch {
        // 拦截器已处理
      }
    },
    [currentId, setId, refresh],
  );

  const create = useCallback(
    (conv: { id: number; title: string; status: 'ACTIVE' | 'DELETED'; createdAt: string; updatedAt: string }) => {
      addConv(conv);
    },
    [addConv],
  );

  return { conversations, loading, currentId, select, remove, create, refresh };
};