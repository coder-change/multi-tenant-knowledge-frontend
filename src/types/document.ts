export type DocumentStatus = 'UPLOADED' | 'PROCESSING' | 'INDEXED' | 'FAILED';

export interface DocumentVO {
  id: number;
  title: string;
  fileType: string;
  fileSize: number;
  status: DocumentStatus;
  /** 状态中文说明（后端枚举提供） */
  statusLabel: string;
  chunkCount: number;
  createdAt: string;
}

/**
 * MyBatis-Plus Page 返回结构
 */
export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}