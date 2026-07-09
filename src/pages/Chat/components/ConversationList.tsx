import { List, Spin, Button, Empty, Popconfirm, Typography } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { useConversation } from '@/hooks/useConversation';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

/**
 * 会话列表侧栏
 * 参考 Dify / ChatGPT 左栏设计：
 * - 顶部「新对话」按钮
 * - 会话列表（高亮当前、删除确认）
 * - 空态引导
 */
export const ConversationList = () => {
  const { conversations, loading, currentId, select, remove } =
    useConversation();
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#fafafa',
      }}
    >
      {/* 顶部按钮 */}
      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
        }}
      >
        <Button
          block
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/chat')}
          style={{ borderRadius: 8, height: 38 }}
        >
          开启新对话
        </Button>
      </div>

      {/* 会话列表 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Spin spinning={loading}>
          {conversations.length === 0 ? (
            <Empty
              description="暂无历史对话"
              style={{ marginTop: 80 }}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={conversations}
              split={false}
              renderItem={(c) => {
                const active = currentId === c.id;
                return (
                  <List.Item
                    style={{
                      padding: '0 8px',
                      border: 'none',
                      marginBottom: 2,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: active ? '#e6f4ff' : 'transparent',
                        border: active
                          ? '1px solid #91caff'
                          : '1px solid transparent',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => {
                        select(c.id);
                        navigate(`/chat/${c.id}`);
                      }}
                      onMouseEnter={(e) => {
                        if (!active)
                          (e.currentTarget as HTMLDivElement).style.background =
                            '#f5f5f5';
                      }}
                      onMouseLeave={(e) => {
                        if (!active)
                          (e.currentTarget as HTMLDivElement).style.background =
                            'transparent';
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <MessageOutlined
                            style={{
                              color: active ? '#1677ff' : '#999',
                              fontSize: 14,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: 13,
                              color: active
                                ? '#1677ff'
                                : 'rgba(0,0,0,0.85)',
                              fontWeight: active ? 500 : 400,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {c.title || `会话 #${c.id}`}
                          </Text>
                        </div>
                        <Popconfirm
                          title="确认删除该会话？"
                          onConfirm={(e) => {
                            e?.stopPropagation();
                            remove(c.id);
                          }}
                          onCancel={(e) => e?.stopPropagation()}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<DeleteOutlined />}
                            style={{
                              color: '#999',
                              visibility: 'hidden',
                              opacity: 0,
                              transition: 'opacity 0.2s',
                            }}
                            className="conv-delete-btn"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Popconfirm>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          )}
        </Spin>
      </div>

      {/* hover 显示删除按钮的样式 */}
      <style>{`
        .ant-list-item:hover .conv-delete-btn {
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};