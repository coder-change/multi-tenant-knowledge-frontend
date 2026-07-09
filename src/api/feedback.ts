import { request } from './request';

export interface FeedbackPayload {
  conversationId: number;
  messageId: number;
  rating: number; // 1=赞 0=踩
  comment?: string;
  tags?: string[];
}

export const submitFeedback = (data: FeedbackPayload) =>
  request.post('/v1/feedback', data);