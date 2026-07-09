import { useState, useEffect } from 'react';
import { Tabs, Typography, DatePicker, Space } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { UsageCards } from './components/UsageCards';
import { BillTable } from './components/BillTable';
import { PlanCard } from './components/PlanCard';
import { currentUsage, monthlyUsage, currentBill, monthlyBill, currentPlan } from '@/api/billing';
import type { UsageStats, MonthlyBill, PlanResponse } from '@/types/billing';

const { Title } = Typography;

export const BillingPage = () => {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [bill, setBill] = useState<MonthlyBill | null>(null);
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [month, setMonth] = useState<Dayjs>(dayjs());

  const fetchCurrent = async () => {
    try {
      const [u, b, p] = await Promise.all([currentUsage(), currentBill(), currentPlan()]);
      setUsage(u);
      setBill(b);
      setPlan(p);
    } catch {
      // 拦截器已 toast
    }
  };

  const fetchByMonth = async (m: Dayjs) => {
    try {
      const [u, b] = await Promise.all([
        monthlyUsage(m.year(), m.month() + 1),
        monthlyBill(m.year(), m.month() + 1),
      ]);
      setUsage(u);
      setBill(b);
    } catch {
      // 拦截器已 toast
    }
  };

  useEffect(() => {
    fetchCurrent();
  }, []);

  const handleMonthChange = (m: Dayjs | null) => {
    if (!m) return;
    setMonth(m);
    fetchByMonth(m);
  };

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>
          用量与账单
        </Title>
        <Space>
          <span>查看月份：</span>
          <DatePicker
            value={month}
            onChange={handleMonthChange}
            picker="month"
            allowClear={false}
          />
        </Space>
      </Space>

      <Tabs
        defaultActiveKey="usage"
        items={[
          {
            key: 'usage',
            label: '用量',
            children: <UsageCards data={usage} />,
          },
          {
            key: 'bill',
            label: '账单',
            children: <BillTable data={bill} />,
          },
          {
            key: 'plan',
            label: '套餐',
            children: <PlanCard data={plan} />,
          },
        ]}
      />
    </div>
  );
};
