import { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, Typography, Spin, Empty, Button, Space } from 'antd';
import { FileTextOutlined, MessageOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { currentUsage, currentPlan } from '@/api/billing';
import type { UsageStats, PlanResponse } from '@/types/billing';
import { useAuth } from '@/hooks/useAuth';

const { Title, Paragraph } = Typography;

export const DashboardPage = () => {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, p] = await Promise.all([currentUsage(), currentPlan()]);
        setUsage(u);
        setPlan(p);
      } catch {
        // 拦截器已 toast
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderQuota = (val: number | 'unlimited' | undefined): string => {
    if (val === undefined || val === null) return '-';
    return val === 'unlimited' ? '无限制' : String(val);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={3}>工作台</Title>
      <Paragraph type="secondary">
        欢迎，{user?.username ?? '-'}（租户：{user?.tenantId ?? '-'}）
      </Paragraph>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="当月问答数"
              value={usage?.questionCount ?? 0}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="当月上传文档数"
              value={usage?.uploadCount ?? 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="当月 Token 用量"
              value={usage?.totalTokens ?? 0}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="当前套餐">
            {plan ? (
              <Space direction="vertical" size={4}>
                <div>文档配额：{renderQuota(plan.quotaDocuments)}</div>
                <div>存储配额：{renderQuota(plan.quotaStorageGb)} GB</div>
                <div>月问答配额：{renderQuota(plan.quotaQuestionsPerMonth)}</div>
                <div>基础月费：¥{plan.baseFeeMonthly}</div>
                <div>按量计费：¥{plan.pricePer1kTokens} / 1k token</div>
              </Space>
            ) : (
              <Empty description="暂未加载套餐信息" />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="快捷操作">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Button type="primary" block onClick={() => navigate('/chat')}>
                去提问
              </Button>
              <Button block onClick={() => navigate('/documents')}>
                管理文档
              </Button>
              <Button block onClick={() => navigate('/billing')}>
                查看账单
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
