import { useState, useEffect, useCallback } from 'react';
import { Button, Space, Typography, Empty, Pagination, message } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { UploadModal } from './components/UploadModal';
import { DocumentTable } from './components/DocumentTable';
import type { DocumentVO, PageResult } from '@/types/document';
import { listDocuments } from '@/api/documents';
import { useAuth } from '@/hooks/useAuth';

const { Title } = Typography;

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState<DocumentVO[]>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { canManageDocuments } = useAuth();

  // 加载文档列表
  const fetchDocuments = useCallback(async (page: number, size: number) => {
    setLoading(true);
    try {
      const res: PageResult<DocumentVO> = await listDocuments(page, size);
      setDocuments(res.records);
      setPagination({
        current: res.current,
        pageSize: res.size,
        total: res.total,
      });
    } catch {
      message.error('加载文档列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 首次加载
  useEffect(() => {
    fetchDocuments(pagination.current, pagination.pageSize);
  }, [fetchDocuments, pagination.current, pagination.pageSize]);

  // 状态轮询：若有 PROCESSING 状态，每 3s 刷新
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === 'PROCESSING');
    if (!hasProcessing) return;
    const timer = setInterval(() => {
      fetchDocuments(pagination.current, pagination.pageSize);
    }, 3000);
    return () => clearInterval(timer);
  }, [documents, fetchDocuments, pagination.current, pagination.pageSize]);

  const handleUploadSuccess = (doc: DocumentVO) => {
    setDocuments((prev) => [doc, ...prev]);
    // 刷新列表以确保分页数据同步
    fetchDocuments(pagination.current, pagination.pageSize);
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    fetchDocuments(page, pageSize ?? pagination.pageSize);
  };

  const handleRefresh = () => {
    fetchDocuments(pagination.current, pagination.pageSize);
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0 }}>
          文档管理
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            刷新
          </Button>
          {canManageDocuments() && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadOpen(true)}>
              上传文档
            </Button>
          )}
        </Space>
      </Space>

      <DocumentTable
        data={documents}
        loading={loading}
        onRefresh={handleRefresh}
        canManage={canManageDocuments()}
      />

      {documents.length === 0 && !loading && (
        <Empty description="暂无文档，点击右上角上传第一个文档" />
      )}

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          showTotal={(total) => `共 ${total} 条`}
          onChange={handlePageChange}
        />
      </div>

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};
