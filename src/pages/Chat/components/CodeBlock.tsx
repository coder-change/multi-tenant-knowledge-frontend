import { useState } from 'react';
import { Button, Space, message } from 'antd';
import { CopyOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props {
  language: string;
  code: string;
}

/**
 * 代码块组件：语法高亮 + 一键复制 + 长代码折叠
 * 参考 ChatGPT / Dify 的代码块 UI 模式
 */
export const CodeBlock = ({ language, code }: Props) => {
  const [collapsed, setCollapsed] = useState(code.split('\n').length > 20);

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        margin: '10px 0',
        border: '1px solid #e8e8e8',
      }}
    >
      {/* 顶部工具栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#282c34',
          color: '#abb2bf',
          padding: '6px 14px',
          fontSize: 12,
          fontFamily: 'SF Mono, Monaco, Menlo, monospace',
        }}
      >
        <span style={{ fontWeight: 500 }}>{language || 'text'}</span>
        <Space size={4}>
          <Button
            type="text"
            size="small"
            style={{ color: '#abb2bf', fontSize: 12 }}
            icon={<CopyOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(code).then(
                () => message.success('代码已复制'),
                () => message.error('复制失败'),
              );
            }}
          >
            复制
          </Button>
          {code.split('\n').length > 20 && (
            <Button
              type="text"
              size="small"
              style={{ color: '#abb2bf', fontSize: 12 }}
              icon={collapsed ? <ExpandOutlined /> : <CompressOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? '展开' : '折叠'}
            </Button>
          )}
        </Space>
      </div>

      {/* 代码区域 */}
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        wrapLongLines
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        {collapsed
          ? code.split('\n').slice(0, 20).join('\n') + '\n// … 代码已折叠，点击"展开"查看全部'
          : code}
      </SyntaxHighlighter>
    </div>
  );
};