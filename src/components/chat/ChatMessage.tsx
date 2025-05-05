
// This is to extend the existing ChatMessage component in read-only files

import React from 'react';
import { Message } from '@/types/chat';
import ChatFeedbackSystem from './ChatFeedbackSystem';

interface ChatMessageWrapperProps {
  message: Message;
  onFeedback: (messageId: string, isPositive: boolean, comment?: string) => void;
  children: React.ReactNode;
}

// Create a wrapper component to add feedback to existing ChatMessage
const ChatMessageWrapper: React.FC<ChatMessageWrapperProps> = ({ 
  message, 
  onFeedback, 
  children 
}) => {
  // Only show feedback on assistant messages
  const showFeedback = message.role === 'assistant';

  return (
    <div className="chat-message-wrapper">
      {children}
      {showFeedback && (
        <ChatFeedbackSystem 
          messageId={message.id}
          onFeedback={onFeedback}
        />
      )}
    </div>
  );
};

export default ChatMessageWrapper;
