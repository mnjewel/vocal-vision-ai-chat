
import React from 'react';
import { Message } from '@/types/chat';
import ChatMessageWrapper from '@/components/chat/ChatMessage';

interface EnhancedMessageListProps {
  messages: Message[];
  isTyping?: boolean;
  onDeleteMessage?: (id: string) => void;
  renderMessageWrapper?: (message: Message, children: React.ReactNode) => React.ReactNode;
}

const EnhancedMessageList: React.FC<EnhancedMessageListProps> = ({
  messages,
  isTyping = false,
  onDeleteMessage,
  renderMessageWrapper
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !isTyping && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">Welcome to W3J Assistant</h3>
            <p className="text-muted-foreground">Start a conversation to get help.</p>
          </div>
        </div>
      )}
      
      {messages.map(message => {
        // Skip system messages from the beginning
        if (message.role === 'system' && messages.indexOf(message) === 0) {
          return null;
        }
        
        // Create the message component
        const messageComponent = (
          <ChatMessageWrapper
            key={message.id}
            message={message}
            onFeedback={undefined}
            onDelete={onDeleteMessage ? () => onDeleteMessage(message.id) : undefined}
          >
            <div className="message-content p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <div className="message-body">
                {message.content}
              </div>
            </div>
          </ChatMessageWrapper>
        );
        
        // Wrap the message if a wrapper function is provided
        if (renderMessageWrapper) {
          return (
            <React.Fragment key={message.id}>
              {renderMessageWrapper(message, messageComponent)}
            </React.Fragment>
          );
        }
        
        return messageComponent;
      })}
      
      {isTyping && (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-violet-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[90%]">
            <div className="flex space-x-1.5">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMessageList;
