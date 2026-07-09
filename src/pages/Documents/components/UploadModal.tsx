import { useState } from 'react';
import { Modal, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { uploadDocument, uploadBatch } from '@/api/documents';
import type { DocumentVO } from '@/types/document';

const { Dragger } = Upload;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (doc: DocumentVO) => void;
}

export const UploadModal = ({ open, onClose, onSuccess }: Props) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setFileList([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择文件');
      return;
    }
    setSubmitting(true);
    try {
      if (fileList.length === 1) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj as Blob);
        const doc = await uploadDocument(formData);
        message.success(`上传成功：${doc.title}`);
        onSuccess(doc);
      } else {
        const formData = new FormData();
        fileList.forEach((f) => {
          formData.append('files', f.originFileObj as Blob);
        });
        const docs = await uploadBatch(formData);
        message.success(`批量上传成功：${docs.length} 个文件`);
        docs.forEach(onSuccess);
      }
      reset();
      onClose();
    } catch {
      // 拦截器已 toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="上传文档"
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="上传"
      cancelText="取消"
      width={600}
    >
      <Dragger
        multiple
        beforeUpload={() => false}
        fileList={fileList}
        onChange={({ fileList }) => setFileList(fileList)}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.md,.markdown,.txt"
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint" style={{ fontSize: 12, color: '#999' }}>
          支持 PDF / Word / Excel / Markdown / TXT，单文件最大 50MB
        </p>
      </Dragger>
    </Modal>
  );
};
