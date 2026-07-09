import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMemo } from 'react';
import { CodeBlock } from './CodeBlock';

interface Props {
  content: string;
  streaming?: boolean;
}

/**
 * 渐进式 Markdown 渲染组件
 * - 流式输出时自动补全未闭合的代码块 fence，防止 react-markdown 崩溃
 * - 支持 GFM 表格、任务列表、删除线
 * - 代码块使用 CodeBlock 组件（语法高亮 + 复制 + 折叠）
 *
 * 参考 ChatGPT / 通义千问 的 Markdown 渲染效果
 */
export const StreamingMarkdown = ({ content, streaming }: Props) => {
  // 流式输出时，若 ``` 未成对闭合，临时补一个 ``` 防止渲染异常
  const safeContent = useMemo(() => {
    if (!streaming) return content;
    const count = (content.match(/```/g) || []).length;
    return count % 2 === 1 ? content + '\n```' : content;
  }, [content, streaming]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // 代码块：使用 CodeBlock 组件替代默认 <code>
        code({ inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const codeStr = String(children).replace(/\n$/, '');
          if (!inline && match) {
            return <CodeBlock language={match[1]} code={codeStr} />;
          }
          if (!inline) {
            return <CodeBlock language="" code={codeStr} />;
          }
          return (
            <code
              className={className}
              style={{
                background: 'rgba(0,0,0,0.06)',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: '0.9em',
                fontFamily: 'SF Mono, Monaco, Menlo, monospace',
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
        // 链接：新标签页打开
        a({ href, children }) {
          return (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          );
        },
        // 表格：横向滚动
        table({ children }) {
          return (
            <div style={{ overflowX: 'auto', margin: '8px 0' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                {children}
              </table>
            </div>
          );
        },
        // 给 th/td 加上边框样式
        th({ children }) {
          return (
            <th
              style={{
                border: '1px solid #e8e8e8',
                padding: '8px 12px',
                background: '#fafafa',
                fontWeight: 600,
                textAlign: 'left',
              }}
            >
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td
              style={{
                border: '1px solid #e8e8e8',
                padding: '8px 12px',
              }}
            >
              {children}
            </td>
          );
        },
        // 引用块样式
        blockquote({ children }) {
          return (
            <blockquote
              style={{
                borderLeft: '3px solid #1677ff',
                paddingLeft: 12,
                margin: '8px 0',
                color: 'rgba(0,0,0,0.65)',
                background: 'rgba(22,119,255,0.04)',
                borderRadius: '0 4px 4px 0',
              }}
            >
              {children}
            </blockquote>
          );
        },
      }}
    >
      {safeContent}
    </ReactMarkdown>
  );
};