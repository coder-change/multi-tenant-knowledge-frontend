import { Descriptions, Card, Empty } from 'antd';
import type { MonthlyBill } from '@/types/billing';

interface Props {
  data: MonthlyBill | null;
  loading?: boolean;
}

export const BillTable = ({ data, loading }: Props) => {
  if (!data && !loading) {
    return <Empty description="暂无账单数据" />;
  }
  return (
    <Card loading={loading} title={`${data?.month ?? ''} 账单`}>
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="租户">{data?.tenantId ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="套餐">{data?.plan ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="问答数">{data?.questionCount ?? 0}</Descriptions.Item>
        <Descriptions.Item label="上传文档数">{data?.uploadCount ?? 0}</Descriptions.Item>
        <Descriptions.Item label="Token 用量">{data?.totalTokens ?? 0}</Descriptions.Item>
        <Descriptions.Item label="基础月费">¥{data?.baseFee ?? 0}</Descriptions.Item>
        <Descriptions.Item label="按量费用">¥{data?.usageFee ?? 0}</Descriptions.Item>
        <Descriptions.Item label="合计">
          <span style={{ color: '#cf1322', fontSize: 16, fontWeight: 600 }}>
            ¥{data?.totalFee ?? 0}
          </span>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
