
import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/chat';
import ChatMessageWrapper from './ChatMessage';

interface MessageListProps {
  messages: Message[];
  isTyping?: boolean;
  onDeleteMessage?: (id: string) => void;
  renderMessageWrapper?: (message: Message, children: React.ReactNode) => React.ReactNode;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isTyping = false,
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
            <ChatMessageWrapper
              key={message.id}
              message={message}
              onDelete={onDeleteMessage ? () => onDeleteMessage(message.id) : undefined}
            >
              <div className={`message-${message.role} p-4 rounded-lg ${
                message.role === 'user' ? 'bg-blue-50 dark:bg-blue-900/20 ml-auto' : 
                message.role === 'assistant' ? 'bg-white dark:bg-gray-800 mr-auto' :
                'bg-gray-100 dark:bg-gray-700/50 mx-auto'
              } shadow-sm max-w-[85%]`}>
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            </ChatMessageWrapper>
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
