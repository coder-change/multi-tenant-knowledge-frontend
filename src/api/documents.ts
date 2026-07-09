import { request } from './request';
import type { DocumentVO, PageResult } from '@/types/document';

export const uploadDocument = (formData: FormData): Promise<DocumentVO> =>
  request.post('/v1/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const uploadBatch = (formData: FormData): Promise<DocumentVO[]> =>
  request.post('/v1/documents/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const health = (): Promise<{ status: string }> =>
  request.get('/v1/documents/health');

/**
 * 分页查询文档列表
 */
export const listDocuments = (page: number, size: number): Promise<PageResult<DocumentVO>> =>
  request.get('/v1/documents', { params: { page, size } });

/**
 * 查看文档详情
 */
export const getDocument = (id: number): Promise<DocumentVO> =>
  request.get(`/v1/documents/${id}`);

/**
 * 下载文档（返回 Blob + 文件名）
 */
export const downloadDocument = async (id: number): Promise<{ blob: Blob; filename: string }> => {
  // 通过专用 axios 请求拿到 blob，绕过统一拦截器对 resp.data 的解包
  const axios = (await import('axios')).default;
  const token = JSON.parse(localStorage.getItem('kb-auth') || '{}')?.token;
  const resp = await axios.get(`/api/v1/documents/${id}/download`, {
    responseType: 'blob',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  // 从 Content-Disposition 提取文件名
  const disposition = resp.headers['content-disposition'] || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? `document-${id}`;

  return { blob: resp.data as Blob, filename };
};

/**
 * 重试文档处理（仅 PROCESSING 或 FAILED 状态可重试）
 */
export const retryDocument = (id: number): Promise<{ message: string; document: DocumentVO }> =>
  request.post(`/v1/documents/${id}/retry`);

/**
 * 删除文档（逻辑删除）
 */
export const deleteDocument = (id: number): Promise<{ message: string }> =>
  request.delete(`/v1/documents/${id}`);