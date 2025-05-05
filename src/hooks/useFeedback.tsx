
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/AuthProvider';
import { useSettingsStore } from '@/stores/settingsStore';

interface FeedbackItem {
  messageId: string;
  isPositive: boolean;
  comment?: string;
  submittedAt: Date;
}

export const useFeedback = () => {
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([]);
  const { user } = useAuthContext();
  const { autoSaveMessages } = useSettingsStore();

  const submitFeedback = useCallback(async (
    messageId: string,
    isPositive: boolean,
    comment?: string
  ) => {
    try {
      const newFeedback: FeedbackItem = {
        messageId,
        isPositive,
        comment,
        submittedAt: new Date()
      };
      
      // Add to local state
      setFeedbackHistory(prev => [...prev, newFeedback]);
      
      // Save to Supabase if logged in and auto-save is enabled
      if (user && autoSaveMessages) {
        try {
          // Instead of using a table that doesn't exist, log feedback to console
          // and store it locally only for now
          console.log('Would save feedback to Supabase:', { 
            message_id: messageId,
            user_id: user.id,
            is_positive: isPositive,
            comment: comment || null
          });
          
          // Commented out due to missing table
          // await supabase.from('message_feedback').insert({
          //   message_id: messageId,
          //   user_id: user.id,
          //   is_positive: isPositive,
          //   comment: comment || null
          // });
        } catch (error) {
          console.error('Failed to save feedback to database:', error);
          // Continue with local feedback only
        }
      }
      
      // Optionally notify user
      const feedbackType = isPositive ? 'positive' : 'improvement';
      toast.success(`Thank you for your ${feedbackType} feedback!`);
      
      // Return the feedback item
      return newFeedback;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
      return null;
    }
  }, [user, autoSaveMessages]);

  const getFeedbackForMessage = useCallback((messageId: string) => {
    return feedbackHistory.find(item => item.messageId === messageId);
  }, [feedbackHistory]);

  return {
    feedbackHistory,
    submitFeedback,
    getFeedbackForMessage
  };
};

export default useFeedback;
