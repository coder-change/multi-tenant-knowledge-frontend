import { request } from './request';
import type { UsageStats, MonthlyBill, PlanResponse } from '@/types/billing';

export const currentUsage = (): Promise<UsageStats> => request.get('/v1/billing/usage');

export const monthlyUsage = (year: number, month: number): Promise<UsageStats> =>
  request.get(`/v1/billing/usage/${year}/${month}`);

export const currentBill = (): Promise<MonthlyBill> => request.get('/v1/billing/bill');

export const monthlyBill = (year: number, month: number): Promise<MonthlyBill> =>
  request.get(`/v1/billing/bill/${year}/${month}`);

export const currentPlan = (): Promise<PlanResponse> => request.get('/v1/billing/plan');
