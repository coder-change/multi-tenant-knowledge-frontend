import { Card, Descriptions, Tag, Empty } from 'antd';
import type { PlanResponse } from '@/types/billing';

interface Props {
  data: PlanResponse | null;
  loading?: boolean;
}

const renderQuota = (val: number | 'unlimited' | undefined): React.ReactNode => {
  if (val === undefined || val === null) return '-';
  return val === 'unlimited' ? <Tag color="green">无限制</Tag> : String(val);
};

export const PlanCard = ({ data, loading }: Props) => {
  if (!data && !loading) {
    return <Empty description="暂无套餐信息" />;
  }
  return (
    <Card loading={loading} title="当前套餐">
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="文档配额">{renderQuota(data?.quotaDocuments)}</Descriptions.Item>
        <Descriptions.Item label="存储配额">{renderQuota(data?.quotaStorageGb)} GB</Descriptions.Item>
        <Descriptions.Item label="月问答配额">
          {renderQuota(data?.quotaQuestionsPerMonth)}
        </Descriptions.Item>
        <Descriptions.Item label="基础月费">¥{data?.baseFeeMonthly ?? 0}</Descriptions.Item>
        <Descriptions.Item label="按量计费">¥{data?.pricePer1kTokens ?? 0} / 1k token</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
