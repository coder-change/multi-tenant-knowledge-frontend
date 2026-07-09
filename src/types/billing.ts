export interface UsageStats {
  tenantId: string;
  questionCount: number;
  uploadCount: number;
  totalTokens: number;
  periodStart: string;
  periodEnd: string;
}

export interface MonthlyBill {
  tenantId: string;
  plan: string;
  month: string;
  questionCount: number;
  uploadCount: number;
  totalTokens: number;
  baseFee: number;
  usageFee: number;
  totalFee: number;
}

export interface PlanResponse {
  quotaDocuments: number | 'unlimited';
  quotaStorageGb: number | 'unlimited';
  quotaQuestionsPerMonth: number | 'unlimited';
  baseFeeMonthly: number;
  pricePer1kTokens: number;
}