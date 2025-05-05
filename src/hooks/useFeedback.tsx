
import { useCallback } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Type definitions
interface FeedbackData {
  id: string;
  messageId: string;
  userId?: string;
  isPositive: boolean;
  comment?: string;
  createdAt: Date;
}

export interface UseFeedbackResult {
  submitFeedback: (messageId: string, isPositive: boolean, comment?: string) => Promise<void>;
}

/**
 * A hook to handle user feedback for AI messages
 */
export const useFeedback = (): UseFeedbackResult => {
  // Submit feedback handler
  const submitFeedback = useCallback(async (
    messageId: string, 
    isPositive: boolean, 
    comment?: string
  ): Promise<void> => {
    try {
      // Create feedback data object
      const feedbackData: FeedbackData = {
        id: uuidv4(),
        messageId,
        isPositive,
        comment,
        createdAt: new Date(),
      };

      console.log('Feedback submitted:', feedbackData);
      
      // For now just log feedback to console, but in the future
      // we can store it in local storage or send to a backend
      // when Supabase is connected
      
      // Success notification
      toast.success(
        isPositive 
          ? "Thank you for your positive feedback!" 
          : "Thank you for helping us improve"
      );
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  }, []);

  return { submitFeedback };
};

export default useFeedback;
