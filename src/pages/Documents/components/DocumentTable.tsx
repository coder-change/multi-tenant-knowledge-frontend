import { Table, Tag, Button, Space, Popconfirm, message } from 'antd';
import { DownloadOutlined, DeleteOutlined, RedoOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DocumentVO } from '@/types/document';
import { formatDateTime, formatFileSize, documentStatusColor, documentStatusLabel } from '@/utils/format';
import { downloadDocument, retryDocument, deleteDocument } from '@/api/documents';

interface Props {
  data: DocumentVO[];
  loading?: boolean;
  onRefresh?: () => void;
  canManage?: boolean;
}

export const DocumentTable = ({ data, loading, onRefresh, canManage }: Props) => {
  const handleDownload = async (record: DocumentVO) => {
    try {
      const { blob, filename } = await downloadDocument(record.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('下载失败');
    }
  };

  const handleRetry = async (id: number) => {
    try {
      await retryDocument(id);
      message.success('已重新提交处理');
      onRefresh?.();
    } catch {
      // 拦截器已 toast
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDocument(id);
      message.success('删除成功');
      onRefresh?.();
    } catch {
      // 拦截器已 toast
    }
  };

  const columns: ColumnsType<DocumentVO> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '类型', dataIndex: 'fileType', width: 100 },
    {
      title: '大小',
      dataIndex: 'fileSize',
      width: 120,
      render: (val: number) => formatFileSize(val),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={documentStatusColor(status)}>{documentStatusLabel(status)}</Tag>
      ),
    },
    { title: 'Chunk 数', dataIndex: 'chunkCount', width: 100 },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (val: string) => formatDateTime(val),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {(record.status === 'PROCESSING' || record.status === 'FAILED') && canManage && (
            <Button
              type="text"
              icon={<RedoOutlined />}
              onClick={() => handleRetry(record.id)}
            >
              重试
            </Button>
          )}
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            下载
          </Button>
          {canManage && (
            <Popconfirm
              title="确认删除？"
              description={`删除后将无法恢复：${record.title}`}
              onConfirm={() => handleDelete(record.id)}
              okText="删除"
              cancelText="取消"
            >
              <Button type="text" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table<DocumentVO>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: false }}
      scroll={{ x: 1000 }}
    />
  );
};
