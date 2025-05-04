
import React from 'react';
import { Message } from '@/types/chat';
import MessageReactions from './MessageReactions';
import FollowUpSuggestions from './FollowUpSuggestions';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onReaction?: (messageId: string, reaction: string, active: boolean) => void;
  onFollowUpClick?: (suggestion: string) => void;
  onDelete?: (id: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onReaction,
  onFollowUpClick,
  onDelete
}) => {
  const { role, content, timestamp, imageUrl, id } = message;

  const isUserMessage = role === 'user';
  const isAssistantMessage = role === 'assistant';

  const timeAgo = timestamp ? formatDistanceToNow(new Date(timestamp), { addSuffix: true }) : null;

  return (
    <div className={`message-container ${isUserMessage ? 'message-user' : isAssistantMessage ? 'message-assistant' : 'message-system'}`}>
      {/* Image if available */}
      {imageUrl && (
        <div className="mb-2">
          <img src={imageUrl} alt="Uploaded" className="rounded-md max-h-48 w-auto" />
        </div>
      )}

      {/* Message Content */}
      <div className="message-content break-words">
        {content}
      </div>

      {/* Timestamp */}
      {timeAgo && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {timeAgo}
        </div>
      )}

      {/* Reactions - only for assistant messages */}
      {isAssistantMessage && onReaction && (
        <MessageReactions 
          messageId={id} 
          onReactionToggle={onReaction} 
        />
      )}

      {/* Follow-up Suggestions - only for assistant messages */}
      {isAssistantMessage && onFollowUpClick && (
        <FollowUpSuggestions 
          suggestions={[
            "Tell me more.",
            "Explain it simply.",
            "Give me code example."
          ]} 
          onSuggestionClick={onFollowUpClick} 
        />
      )}

      {/* Delete Button - only for user messages and if onDelete is provided */}
      {isUserMessage && onDelete && (
        <button
          onClick={() => onDelete(id)}
          className="absolute top-1 right-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </button>
      )}
    </div>
  );
};

export default ChatMessage;
