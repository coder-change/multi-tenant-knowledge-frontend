import dayjs from 'dayjs';

/**
 * 格式化日期时间
 */
export const formatDateTime = (date: string | Date | undefined | null): string => {
  if (!date) return '-';
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number | undefined | null): string => {
  if (bytes === undefined || bytes === null) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

/**
 * 文档状态颜色映射
 */
export const documentStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    UPLOADED: 'blue',
    PROCESSING: 'orange',
    INDEXED: 'green',
    FAILED: 'red',
  };
  return map[status] ?? 'default';
};

/**
 * 文档状态中文映射表（与后端 DocumentStatus 枚举保持一致）
 */
export const DOCUMENT_STATUS_MAP: Record<string, string> = {
  UPLOADED: '已上传',
  PROCESSING: '处理中',
  INDEXED: '已索引',
  FAILED: '处理失败',
};

/**
 * 文档状态中文（前端映射表，与后端枚举同步）
 */
export const documentStatusLabel = (status: string): string => {
  return DOCUMENT_STATUS_MAP[status] ?? status;
};