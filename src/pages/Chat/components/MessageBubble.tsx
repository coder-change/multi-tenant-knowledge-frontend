import { Space, Typography } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import type { ChatMessage } from '@/types/chat';
import { StreamingMarkdown } from './StreamingMarkdown';
import { CitationChip } from './CitationChip';
import { FeedbackBar } from './FeedbackBar';

const { Text } = Typography;

interface Props {
  message: ChatMessage;
  onCiteClick?: (chunkIndex: number) => void;
  onRegenerate?: () => void;
}

/**
 * 消息气泡组件
 * - 用户消息：右对齐，蓝色填充气泡
 * - AI 消息：左对齐，白色卡片气泡 + Markdown 渲染 + 引用 chip + 反馈栏
 * - 流式输出中：blinking 打字光标
 *
 * 参考 ChatGPT 气泡布局 + Perplexity 引用交互
 */
export const MessageBubble = ({ message, onCiteClick, onRegenerate }: Props) => {
  const isUser = message.role === 'user';
  const sources = message.sources ?? [];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 20,
        padding: '0 8px',
      }}
    >
      <div style={{ maxWidth: '82%', minWidth: 200 }}>
        {/* 角色标识行 */}
        <Space
          style={{
            marginBottom: 6,
            paddingLeft: isUser ? 0 : 4,
            paddingRight: isUser ? 4 : 0,
            display: 'flex',
            justifyContent: isUser ? 'flex-end' : 'flex-start',
          }}
          size={4}
        >
          {!isUser && <RobotOutlined style={{ color: '#1677ff', fontSize: 14 }} />}
          <Text type="secondary" style={{ fontSize: 11 }}>
            {isUser ? '我' : 'AI 助手'}
            {message.streaming && (
              <span style={{ color: '#1677ff' }}> · 正在生成…</span>
            )}
            {!isUser && !message.streaming && message.latencyMs !== undefined && (
              <span> · {(message.latencyMs / 1000).toFixed(1)}s</span>
            )}
          </Text>
          {isUser && <UserOutlined style={{ color: '#1677ff', fontSize: 14 }} />}
        </Space>

        {/* 气泡卡片 */}
        {isUser ? (
          /* --- 用户消息：蓝色填充 --- */
          <div
            style={{
              background: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: '16px 4px 16px 16px',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              fontSize: 14,
              boxShadow: '0 1px 4px rgba(22,119,255,0.3)',
            }}
          >
            {message.content}
          </div>
        ) : (
          /* --- AI 消息：白色卡片 --- */
          <div
            style={{
              background: '#ffffff',
              padding: '14px 18px',
              borderRadius: '4px 16px 16px 16px',
              lineHeight: 1.75,
              fontSize: 14,
              color: 'rgba(0,0,0,0.85)',
              border: '1px solid #f0f0f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <StreamingMarkdown
              content={message.content}
              streaming={!!message.streaming}
            />

            {/* 流式打字光标 */}
            {message.streaming && (
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 16,
                  background: '#1677ff',
                  marginLeft: 2,
                  verticalAlign: 'text-bottom',
                  borderRadius: 1,
                  animation: 'kb-blink 1s step-end infinite',
                }}
              />
            )}
          </div>
        )}

        {/* 引用标签行 */}
        {!isUser && sources.length > 0 && (
          <div style={{ marginTop: 8, paddingLeft: 4 }}>
            <Text type="secondary" style={{ fontSize: 11, marginRight: 4 }}>
              引用来源:
            </Text>
            {sources.map((s, i) => (
              <CitationChip
                key={s.chunkId || i}
                index={i + 1}
                source={s}
                onLocate={() => onCiteClick?.(i)}
              />
            ))}
          </div>
        )}

        {/* 反馈栏（回答完成后） */}
        {!isUser && !message.streaming && message.content && (
          <FeedbackBar
            messageId={Number(message.id)}
            conversationId={message.conversationId ?? 0}
            onRegenerate={onRegenerate}
          />
        )}
      </div>

      {/* 全局闪烁动画 */}
      <style>{`
        @keyframes kb-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};