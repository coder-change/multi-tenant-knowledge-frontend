import { useCallback } from 'react';
import { message as antdMsg } from 'antd';
import { submitFeedback, type FeedbackPayload } from '@/api/feedback';

/**
 * 用户反馈 Hook
 * 封装提交反馈逻辑（赞 / 踩 + 标签 + 评论）
 */
export const useFeedback = () => {
  const submit = useCallback(async (payload: FeedbackPayload) => {
    try {
      await submitFeedback(payload);
      antdMsg.success('感谢反馈！');
    } catch {
      // 拦截器已 toast
    }
  }, []);

  return { submit };
};