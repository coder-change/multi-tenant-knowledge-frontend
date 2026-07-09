import { Row, Col, Card, Statistic } from 'antd';
import { FileTextOutlined, MessageOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { UsageStats } from '@/types/billing';

interface Props {
  data: UsageStats | null;
  loading?: boolean;
}

export const UsageCards = ({ data, loading }: Props) => (
  <Row gutter={16}>
    <Col span={8}>
      <Card loading={loading}>
        <Statistic title="问答数" value={data?.questionCount ?? 0} prefix={<MessageOutlined />} />
      </Card>
    </Col>
    <Col span={8}>
      <Card loading={loading}>
        <Statistic
          title="上传文档数"
          value={data?.uploadCount ?? 0}
          prefix={<FileTextOutlined />}
        />
      </Card>
    </Col>
    <Col span={8}>
      <Card loading={loading}>
        <Statistic
          title="Token 用量"
          value={data?.totalTokens ?? 0}
          prefix={<ThunderboltOutlined />}
        />
      </Card>
    </Col>
  </Row>
);
