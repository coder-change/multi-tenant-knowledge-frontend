import { useEffect, useState, useCallback, useRef } from 'react';
import { Button, Space, Typography, message } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageBubble } from './components/MessageBubble';
import { SourcePanel } from './components/SourcePanel';
import { ConversationList } from './components/ConversationList';
import { InputBar } from './components/InputBar';
import { useChatStore } from '@/stores/chatStore';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { getConversationMessages } from '@/api/chat';
import type { SseEvent } from '@/types/chat';

const { Title } = Typography;

/**
 * ChatPage — 三栏布局（参考 Dify / FastGPT）
 *
 * 左栏 (260px): 会话列表 ConversationList
 * 中栏 (flex):  消息列表 + 输入栏
 * 右栏 (340px): 引用来源 SourcePanel
 *
 * 支持 SSE 流式问答、停止生成、重新生成、引用联动高亮
 * 路由：/chat 和 /chat/:conversationId
 */
export const ChatPage = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    currentSources,
    currentConversationId,
    setCurrentConversationId,
    addMessage,
    patchMessage,
    finishMessage,
    setStreamingMessage,
    clearMessages,
    loadMessages,
  } = useChatStore();

  // SSE 流式事件处理
  const handleSseEvent = useCallback(
    (ev: SseEvent, aiMsgId: string) => {
      switch (ev.type) {
        case 'start':
          setCurrentConversationId(ev.conversationId);
          navigate(`/chat/${ev.conversationId}`, { replace: true });
          break;
        case 'delta':
          patchMessage(aiMsgId, {
            content:
              (useChatStore.getState().messages.find((m) => m.id === aiMsgId)
                ?.content ?? '') + ev.content,
          });
          break;
        case 'sources':
          patchMessage(aiMsgId, { sources: ev.sources });
          setHighlightIndex(0);
          break;
        case 'done':
          finishMessage(
            aiMsgId,
            useChatStore.getState().messages.find((m) => m.id === aiMsgId)?.sources ?? [],
            ev.latencyMs,
          );
          break;
        case 'error':
          message.error(ev.message);
          finishMessage(aiMsgId, [], 0);
          break;
      }
    },
    [
      setCurrentConversationId,
      navigate,
      patchMessage,
      finishMessage,
    ],
  );

  const { send, abort, isStreaming } = useStreamingChat({
    onEvent: (ev) => {
      const sid = useChatStore.getState().streamingMessageId;
      if (sid) handleSseEvent(ev, sid);
    },
    onError: (err) => message.error('网络异常：' + err.message),
    onDone: () => {
      // finishMessage 在 handleSseEvent 的 done 事件中已处理
    },
  });

  // URL 同步会话 ID
  useEffect(() => {
    if (conversationId) {
      const id = Number(conversationId);
      if (!isNaN(id)) {
        setCurrentConversationId(id);
        // 加载历史消息
        getConversationMessages(id)
          .then((conv: any) => {
            // 后端返回 ConversationVO，messages 字段是消息数组
            const msgs = conv?.messages ?? conv;
            if (Array.isArray(msgs)) {
              // 后端消息格式转前端 ChatMessage
              loadMessages(
                msgs.map((m: any) => ({
                  id: String(m.id ?? m.messageId ?? ''),
                  role: m.role?.toLowerCase() ?? 'user',
                  content: m.content ?? '',
                  sources: [],
                  latencyMs: 0,
                  timestamp: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
                  conversationId: id,
                })),
              );
            }
          })
          .catch(() => {
            // 会话可能不存在
          });
        return;
      }
    }
    setCurrentConversationId(null);
    clearMessages();
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Esc 停止生成
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isStreaming) {
        abort();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isStreaming, abort]);

  // 发送消息
  const handleSend = useCallback(
    (q: string) => {
      addMessage({ role: 'user', content: q, conversationId: currentConversationId ?? undefined });
      const aiId = addMessage({
        role: 'assistant',
        content: '',
        streaming: true,
        conversationId: currentConversationId ?? undefined,
      });
      setStreamingMessage(aiId, null);
      send(q, currentConversationId?.toString());
    },
    [currentConversationId, addMessage, setStreamingMessage, send],
  );

  // 重新生成
  const handleRegenerate = useCallback(() => {
    const msgs = useChatStore.getState().messages;
    // 找到最后一个用户消息
    const lastUserIdx = [...msgs].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIdx === -1) return;
    const lastUser = msgs[msgs.length - 1 - lastUserIdx];
    // 删除最后一条 assistant 消息
    const lastAssistant = msgs[msgs.length - 1];
    if (lastAssistant?.role === 'assistant') {
      handleSend(lastUser.content);
    }
  }, [handleSend]);

  // 页面可用高度 = 100vh - BasicLayout Header(64) - Content margin(32) - Content padding(32)
  const pageHeight = 'calc(100vh - 128px)';

  return (
    <div style={{ display: 'flex', height: pageHeight, margin: -16, borderRadius: 8, overflow: 'hidden' }}>
      {/* ===== 左栏：会话列表 ===== */}
      <div
        style={{
          width: 260,
          minWidth: 260,
          background: '#fafafa',
          borderRight: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ConversationList />
      </div>

      {/* ===== 中栏：对话区 ===== */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          minWidth: 0,
        }}
      >
        {/* 顶部标题栏 */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fafafa',
          }}
        >
          <Title level={5} style={{ margin: 0, fontSize: 15 }}>
            {currentConversationId
              ? `会话 #${currentConversationId}`
              : '开启新对话'}
          </Title>
          <Space>
            {isStreaming && (
              <Button size="small" onClick={abort} danger>
                停止生成
              </Button>
            )}
            <Button
              size="small"
              icon={<ClearOutlined />}
              onClick={() => {
                clearMessages();
                navigate('/chat');
              }}
              disabled={messages.length === 0}
            >
              清空对话
            </Button>
          </Space>
        </div>

        {/* 消息列表 */}
        <div
          ref={chatContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            background: '#ffffff',
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#999',
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  marginBottom: 16,
                  opacity: 0.3,
                }}
              >
                💬
              </div>
              <div style={{ fontSize: 15, marginBottom: 8, color: '#666' }}>
                开始提问吧
              </div>
              <div style={{ fontSize: 13 }}>
                例如：Spring AI 2.0 支持哪个 JDK 版本？
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                onCiteClick={(i) => setHighlightIndex(i)}
                onRegenerate={
                  m.role === 'assistant' &&
                  !m.streaming &&
                  m === messages[messages.length - 1]
                    ? handleRegenerate
                    : undefined
                }
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 底部输入栏 */}
        <InputBar
          loading={false}
          streaming={isStreaming}
          onSend={handleSend}
          onAbort={abort}
        />
      </div>

      {/* ===== 右栏：引用来源 ===== */}
      <div
        style={{
          width: 340,
          minWidth: 340,
          background: '#fafafa',
          borderLeft: '1px solid #f0f0f0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SourcePanel
          sources={currentSources}
          highlightIndex={highlightIndex}
          onLocate={(i) => setHighlightIndex(i)}
        />
      </div>
    </div>
  );
};