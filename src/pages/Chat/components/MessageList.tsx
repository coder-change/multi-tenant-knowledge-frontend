import { Empty } from 'antd';
import { MessageItem } from './MessageItem';
import type { ChatMessage } from '@/types/chat';

interface Props {
  messages: ChatMessage[];
}

export const MessageList = ({ messages }: Props) => {
  if (messages.length === 0) {
    return (
      <Empty
        description="开始提问吧。例如：Spring AI 2.0 支持哪个 JDK？"
        style={{ marginTop: 64 }}
      />
    );
  }

  return (
    <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
    </div>
  );
};
