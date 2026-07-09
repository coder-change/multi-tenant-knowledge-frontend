import { useEffect, useRef } from 'react';
import { Empty, Card, Tag, Typography } from 'antd';
import type { RetrievedChunk } from '@/types/chat';

const { Text, Paragraph } = Typography;

interface Props {
  sources: RetrievedChunk[];
  highlightIndex?: number | null;
  onLocate?: (idx: number | null) => void;
}

/**
 * 右侧引用来源面板
 * - 展示检索到的文档片段列表
 * - 支持点击高亮联动（与 CitationChip 配合）
 * - 显示 score / rerankScore 双分数
 *
 * 参考 Dify / FastGPT 的右侧引用面板设计
 */
export const SourcePanel = ({ sources, highlightIndex, onLocate }: Props) => {
  const refs = useRef<Array<HTMLDivElement | null>>([]);

  // 高亮项自动滚动到可视区
  useEffect(() => {
    if (highlightIndex == null) return;
    const el = refs.current[highlightIndex];
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightIndex]);

  if (sources.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Empty
          description="尚无引用来源"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '12px 8px',
        overflowY: 'auto',
        height: '100%',
      }}
    >
      <div
        style={{
          padding: '0 8px 12px',
          borderBottom: '1px solid #f0f0f0',
          marginBottom: 8,
        }}
      >
        <Text strong style={{ fontSize: 14 }}>
          引用来源
        </Text>
        <Tag color="blue" style={{ marginLeft: 8 }}>
          {sources.length} 条
        </Tag>
      </div>

      <div>
        {sources.map((s, i) => {
          const isHighlighted = highlightIndex === i;
          return (
            <Card
              key={s.chunkId || i}
              size="small"
              hoverable
              ref={(el) => {
                refs.current[i] = el as HTMLDivElement | null;
              }}
              style={{
                marginBottom: 8,
                borderRadius: 8,
                cursor: 'pointer',
                borderColor: isHighlighted ? '#1677ff' : '#f0f0f0',
                boxShadow: isHighlighted
                  ? '0 0 0 2px rgba(22,119,255,0.2)'
                  : 'none',
                transition: 'all 0.2s ease',
                background: isHighlighted ? '#e6f4ff' : '#fff',
              }}
              onClick={() => onLocate?.(isHighlighted ? null : i)}
              styles={{ body: { padding: 10 } }}
            >
              {/* 标题行 */}
              <div style={{ marginBottom: 6 }}>
                <Tag color={isHighlighted ? '#1677ff' : 'blue'} style={{ fontSize: 11 }}>
                  [{i + 1}]
                </Tag>
                <Text
                  strong
                  style={{
                    fontSize: 12,
                    color: isHighlighted ? '#1677ff' : 'rgba(0,0,0,0.85)',
                  }}
                >
                  {s.documentTitle || '未命名文档'}
                </Text>
              </div>

              {/* 分数标签 */}
              <div style={{ marginBottom: 6 }}>
                {s.score !== undefined && (
                  <Tag color="green" style={{ fontSize: 10, margin: '0 2px' }}>
                    检索 {(s.score * 100).toFixed(0)}%
                  </Tag>
                )}
                {s.rerankScore !== undefined && (
                  <Tag color="purple" style={{ fontSize: 10, margin: '0 2px' }}>
                    精排 {(s.rerankScore * 100).toFixed(0)}%
                  </Tag>
                )}
                {s.rrfScore !== undefined && (
                  <Tag color="orange" style={{ fontSize: 10, margin: '0 2px' }}>
                    RRF {(s.rrfScore * 100).toFixed(0)}%
                  </Tag>
                )}
              </div>

              {/* 内容摘要 */}
              <Paragraph
                style={{
                  fontSize: 11,
                  color: 'rgba(0,0,0,0.55)',
                  lineHeight: 1.6,
                  margin: 0,
                }}
                ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}
              >
                {s.content}
              </Paragraph>
            </Card>
          );
        })}
      </div>
    </div>
  );
};