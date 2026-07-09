import { Card, Typography, Tag, Space } from 'antd';
import { UserOutlined, RobotOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '@/types/chat';

const { Text } = Typography;

interface Props {
  message: ChatMessage;
}

export const MessageItem = ({ message }: Props) => {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 16,
      }}
    >
      <div style={{ maxWidth: '70%' }}>
        <Space style={{ marginBottom: 4 }} size={4}>
          {isUser ? <UserOutlined /> : <RobotOutlined />}
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isUser ? '我' : 'AI 助手'}
            {message.latencyMs !== undefined && ` · ${message.latencyMs}ms`}
          </Text>
        </Space>
        <Card
          size="small"
          style={{
            background: isUser ? '#1890ff' : '#f5f5f5',
            color: isUser ? '#fff' : '#000',
            borderRadius: 8,
          }}
          styles={{ body: { padding: 12 } }}
        >
          {isUser ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </Card>
        {message.sources && message.sources.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <Tag color="blue">{message.sources.length} 条引用</Tag>
          </div>
        )}
      </div>
    </div>
  );
};
