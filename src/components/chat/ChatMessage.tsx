
import React from 'react';
import { Message } from '@/types/chat';
import MessageReactions from './MessageReactions';
import FollowUpSuggestions from './FollowUpSuggestions';

interface ChatMessageProps {
  message: Message;
  onReaction?: (messageId: string, reaction: string, active: boolean) => void;
  onFollowUpClick?: (suggestion: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  onReaction, 
  onFollowUpClick 
}) => {
  const getMessageClass = () => {
    switch (message.role) {
      case 'user':
        return 'message-user';
      case 'assistant':
        return 'message-assistant';
      case 'system':
        return 'message-system';
      default:
        return 'message-system';
    }
  };

  // Generate follow-up suggestions based on assistant message content
  // In a real app, these would come from the AI or be stored with the message
  const getFollowUpSuggestions = (): string[] => {
    if (message.role === 'assistant' && message.content) {
      // Simple heuristic to generate suggestions, in a real app this would be more sophisticated
      if (message.content.includes('help')) {
        return ['Tell me more', 'How does this work?', 'Can you give examples?'];
      }
      if (message.content.includes('example')) {
        return ['Show another example', 'How would I use this?'];
      }
      if (message.content.toLowerCase().includes('thank')) {
        return ['You\'re welcome!', 'I have another question'];
      }
      // Default suggestions for assistant messages
      return ['Tell me more', 'Why is this important?', 'How can I use this?'];
    }
    return [];
  };

  return (
    <div className={`${getMessageClass()} shadow-sm`}>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {message.content}
      </div>
      
      {message.imageUrl && (
        <div className="mt-2">
          <img 
            src={message.imageUrl} 
            alt="Uploaded content" 
            className="max-w-xs rounded-md border border-gray-200 dark:border-gray-700" 
          />
        </div>
      )}
      
      {/* Only show reactions for user and assistant messages */}
      {message.role !== 'system' && onReaction && (
        <MessageReactions 
          messageId={message.id} 
          onReactionToggle={onReaction} 
        />
      )}
      
      {/* Only show follow-ups for assistant messages */}
      {message.role === 'assistant' && onFollowUpClick && (
        <FollowUpSuggestions
          suggestions={getFollowUpSuggestions()}
          onSuggestionClick={onFollowUpClick}
        />
      )}
    </div>
  );
};

export default ChatMessage;
