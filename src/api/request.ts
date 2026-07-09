import axios from 'axios';
import { message } from 'antd';

const STORAGE_KEY = 'kb-auth';

export const request = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截：注入 token
request.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const auth = JSON.parse(raw);
      if (auth?.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    }
  } catch {
    // ignore
  }
  return config;
});

// 响应拦截：统一错误处理
request.interceptors.response.use(
  (resp) => resp.data,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = '/login';
    } else if (status === 403) {
      message.warning('无权限访问');
    } else if (status === 429) {
      message.warning('配额超限，请升级套餐');
    } else if (status === 400 || status === 500) {
      const msg = data?.message || '请求失败';
      message.error(msg);
    } else if (!status) {
      message.error('网络异常，请重试');
    }
    return Promise.reject(error);
  },
);
