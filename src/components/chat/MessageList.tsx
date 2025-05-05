
import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/chat';
import ChatMessage from '../chat/ChatMessage';

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  onReaction?: (messageId: string, reaction: string, active: boolean) => void;
  onFollowUpClick?: (suggestion: string) => void;
  onDeleteMessage?: (id: string) => void;
  renderMessageWrapper?: (message: Message, children: React.ReactNode) => React.ReactNode;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isTyping = false,
  onReaction,
  onFollowUpClick,
  onDeleteMessage,
  renderMessageWrapper
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages or when typing
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 neural-messages-container">
      <div className="space-y-4 max-w-4xl mx-auto">
        {messages.map((message) => {
          const messageComponent = (
            <ChatMessage
              key={message.id}
              message={message}
              onReaction={onReaction}
              onFollowUpClick={onFollowUpClick}
              onDelete={onDeleteMessage ? () => onDeleteMessage(message.id) : undefined}
            />
          );
          
          return renderMessageWrapper ? (
            <React.Fragment key={message.id}>
              {renderMessageWrapper(message, messageComponent)}
            </React.Fragment>
          ) : messageComponent;
        })}
        
        {isTyping && (
          <div className="message-assistant max-w-[85%] mr-auto">
            <div className="flex space-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse-gentle"></div>
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse-gentle delay-150"></div>
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse-gentle delay-300"></div>
              <span className="sr-only">AI is typing...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
