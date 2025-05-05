
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackProps {
  messageId: string;
  onFeedback: (messageId: string, isPositive: boolean, comment?: string) => void;
}

const ChatFeedbackSystem: React.FC<FeedbackProps> = ({ messageId, onFeedback }) => {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean>(false);
  const [showCommentBox, setShowCommentBox] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | null>(null);

  const handleFeedback = (isPositive: boolean) => {
    setFeedbackType(isPositive ? 'positive' : 'negative');
    setShowCommentBox(true);
  };

  const submitFeedback = () => {
    if (feedbackType !== null) {
      onFeedback(messageId, feedbackType === 'positive', comment);
      setFeedbackGiven(true);
      setShowCommentBox(false);
    }
  };

  const cancelFeedback = () => {
    setShowCommentBox(false);
    setComment('');
  };

  if (feedbackGiven) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <span>Thank you for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <AnimatePresence>
        {!showCommentBox ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-gray-500 mr-1">Was this response helpful?</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-full"
              onClick={() => handleFeedback(true)}
            >
              <ThumbsUp className="h-4 w-4 text-gray-500 hover:text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-full"
              onClick={() => handleFeedback(false)}
            >
              <ThumbsDown className="h-4 w-4 text-gray-500 hover:text-red-500" />
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {feedbackType === 'positive' 
                  ? 'What did you like about this response?' 
                  : 'How could this response be improved?'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full"
                onClick={cancelFeedback}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-md mb-2 bg-white dark:bg-gray-900"
              rows={3}
              placeholder="Your feedback (optional)"
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={cancelFeedback}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={submitFeedback}
                className="bg-neural-gradient-blue"
              >
                Submit Feedback
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatFeedbackSystem;
