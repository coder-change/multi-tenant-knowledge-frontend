import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  MessageOutlined,
  AccountBookOutlined,
} from '@ant-design/icons';

export const menuItems: MenuProps['items'] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
  { key: '/documents', icon: <FileTextOutlined />, label: '文档管理' },
  { key: '/chat', icon: <MessageOutlined />, label: '知识问答' },
  { key: '/billing', icon: <AccountBookOutlined />, label: '用量账单' },
];
