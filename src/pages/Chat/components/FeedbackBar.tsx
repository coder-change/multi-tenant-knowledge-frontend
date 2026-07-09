import { useState } from 'react';
import { Space, Button, Modal, Input, Tag, message } from 'antd';
import {
  LikeOutlined,
  DislikeOutlined,
  ReloadOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { useFeedback } from '@/hooks/useFeedback';

interface Props {
  messageId: number;
  conversationId: number;
  onRegenerate?: () => void;
}

const BAD_REASON_TAGS = ['不准确', '未找到相关信息', '代码有错误', '回答不完整', '内容无关', '格式混乱'];

/**
 * 反馈操作栏
 * - 👍 / 👎 点赞点踩
 * - 踩时弹窗选择标签 + 补充评论
 * - 重新生成 + 复制回答
 *
 * 参考 ChatGPT / Dify 的消息操作栏
 */
export const FeedbackBar = ({ messageId, conversationId, onRegenerate }: Props) => {
  const [rating, setRating] = useState<0 | 1 | -1>(0); // 0=未评价 1=赞 -1=踩
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { submit } = useFeedback();

  const handleLike = async () => {
    if (rating !== 0) return;
    setRating(1);
    await submit({ conversationId, messageId, rating: 1 });
  };

  const handleDislike = () => {
    if (rating !== 0) return;
    setModalOpen(true);
  };

  const submitDislike = async () => {
    setSubmitting(true);
    await submit({
      conversationId,
      messageId,
      rating: 0,
      tags: selectedTags,
      comment: comment || undefined,
    });
    setSubmitting(false);
    setRating(-1);
    setModalOpen(false);
    setSelectedTags([]);
    setComment('');
  };

  return (
    <>
      <Space size={2} style={{ marginTop: 8, paddingLeft: 4 }}>
        <Button
          size="small"
          type={rating === 1 ? 'primary' : 'text'}
          icon={<LikeOutlined />}
          disabled={rating !== 0}
          onClick={handleLike}
          style={{ fontSize: 12 }}
        />
        <Button
          size="small"
          type={rating === -1 ? 'primary' : 'text'}
          danger={rating === -1}
          icon={<DislikeOutlined />}
          disabled={rating !== 0}
          onClick={handleDislike}
          style={{ fontSize: 12 }}
        />
        <Button
          size="small"
          type="text"
          icon={<ReloadOutlined />}
          onClick={onRegenerate}
          title="重新生成回答"
          style={{ fontSize: 12 }}
        />
        <Button
          size="small"
          type="text"
          icon={<CopyOutlined />}
          onClick={() => {
            // 复制整个回答文本
            const text = document.querySelectorAll('.ant-card-body')[0]?.textContent ?? '';
            navigator.clipboard.writeText(text).then(
              () => message.success('回答已复制'),
              () => message.error('复制失败'),
            );
          }}
          title="复制回答"
          style={{ fontSize: 12 }}
        />
      </Space>

      {/* 踩的反馈弹窗 */}
      <Modal
        title="这条回答哪里不够好？"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedTags([]);
          setComment('');
        }}
        onOk={submitDislike}
        confirmLoading={submitting}
        okText="提交反馈"
        cancelText="取消"
        width={480}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontSize: 13, color: '#666' }}>
            请选择问题标签（可多选）：
          </div>
          <Space wrap size={[4, 8]}>
            {BAD_REASON_TAGS.map((t) => (
              <Tag.CheckableTag
                key={t}
                checked={selectedTags.includes(t)}
                onChange={(checked) =>
                  setSelectedTags((prev) =>
                    checked ? [...prev, t] : prev.filter((x) => x !== t),
                  )
                }
                style={{
                  padding: '2px 10px',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                {t}
              </Tag.CheckableTag>
            ))}
          </Space>
        </div>
        <Input.TextArea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="补充说明（可选）"
          maxLength={500}
          showCount
        />
      </Modal>
    </>
  );
};