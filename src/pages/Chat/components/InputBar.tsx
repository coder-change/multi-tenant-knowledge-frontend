import { useState } from 'react';
import { Input, Button, Space, Tooltip } from 'antd';
import {
  SendOutlined,
  StopOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;

interface Props {
  loading: boolean;
  streaming: boolean;
  onSend: (q: string) => void;
  onAbort: () => void;
}

const PROMPT_TEMPLATES = [
  '请基于知识库回答，标明引用来源',
  '请用列表形式总结要点',
  '请把回答控制在200字以内',
];

/**
 * 输入栏组件
 * - 快捷提示词模板
 * - Cmd/Ctrl+Enter 发送
 * - Esc 停止生成
 * - 流式输出中显示红色停止按钮
 *
 * 参考 ChatGPT / Dify 的底部输入栏设计
 */
export const InputBar = ({ loading, streaming, onSend, onAbort }: Props) => {
  const [q, setQ] = useState('');

  const send = () => {
    const t = q.trim();
    if (!t || streaming) return;
    onSend(t);
    setQ('');
  };

  return (
    <div
      style={{
        borderTop: '1px solid #f0f0f0',
        padding: '12px 16px 16px',
        background: '#fafafa',
      }}
    >
      {/* 快捷提示词 */}
      <Space style={{ marginBottom: 10 }} wrap size={[4, 4]}>
        <ThunderboltOutlined style={{ color: '#faad14', fontSize: 13 }} />
        {PROMPT_TEMPLATES.map((t) => (
          <Button
            key={t}
            size="small"
            type="dashed"
            disabled={streaming}
            onClick={() => setQ(t)}
            style={{
              fontSize: 11,
              borderRadius: 12,
              padding: '0 10px',
              height: 26,
              color: '#666',
            }}
          >
            {t}
          </Button>
        ))}
      </Space>

      {/* 输入行 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <TextArea
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send();
            }
            if (e.key === 'Escape' && streaming) {
              e.preventDefault();
              onAbort();
            }
          }}
          placeholder="输入问题，Cmd/Ctrl+Enter 发送，Esc 停止"
          autoSize={{ minRows: 1, maxRows: 5 }}
          disabled={streaming}
          style={{
            borderRadius: 10,
            fontSize: 14,
            lineHeight: 1.6,
          }}
        />
        {streaming ? (
          <Tooltip title="停止生成 (Esc)">
            <Button
              danger
              icon={<StopOutlined />}
              onClick={onAbort}
              style={{ borderRadius: 8, height: 38, width: 38, flexShrink: 0 }}
            />
          </Tooltip>
        ) : (
          <Tooltip title="发送 (Cmd+Enter)">
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={send}
              loading={loading && !streaming}
              disabled={!q.trim() || streaming}
              style={{
                borderRadius: 8,
                height: 38,
                minWidth: 38,
                flexShrink: 0,
              }}
            >
              发送
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};