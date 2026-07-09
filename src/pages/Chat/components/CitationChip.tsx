import { Popover, Tag } from 'antd';
import type { RetrievedChunk } from '@/types/chat';

interface Props {
  index: number;
  source: RetrievedChunk;
  onLocate?: () => void;
}

/**
 * 引用标签组件
 * hover 时弹出 Popover 显示文档标题和内容预览
 * 点击可联动右侧 SourcePanel 高亮定位
 *
 * 参考 Perplexity / 通义千问 的引用交互
 */
export const CitationChip = ({ index, source, onLocate }: Props) => (
  <Popover
    trigger={['hover', 'click']}
    placement="top"
    content={
      <div style={{ maxWidth: 360 }}>
        <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>
          {source.documentTitle || '未知文档'}
        </div>
        <div
          style={{
            fontSize: 12,
            color: '#666',
            lineHeight: 1.6,
            maxHeight: 120,
            overflow: 'hidden',
          }}
        >
          {source.content.slice(0, 200)}
          {source.content.length > 200 ? '…' : ''}
        </div>
        {source.score !== undefined && (
          <div style={{ marginTop: 6, fontSize: 11, color: '#999' }}>
            相关性: {(source.score * 100).toFixed(1)}%
            {source.rerankScore !== undefined &&
              ` → 精排: ${(source.rerankScore * 100).toFixed(1)}%`}
          </div>
        )}
        {onLocate && (
          <div style={{ marginTop: 6, textAlign: 'right' }}>
            <a onClick={onLocate} style={{ fontSize: 12 }}>
              定位到右侧面板 →
            </a>
          </div>
        )}
      </div>
    }
  >
    <Tag
      color="blue"
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        margin: '0 2px',
        fontSize: 11,
        padding: '0 6px',
        lineHeight: '20px',
        borderRadius: 4,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onLocate?.();
      }}
    >
      [{index}]
    </Tag>
  </Popover>
);