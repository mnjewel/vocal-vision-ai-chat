
import React, { useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import ChatMessage from '@/components/chat/ChatMessage';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  onDeleteMessage: (id: string) => void;
  onSendMessage?: (message: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isTyping, 
  onDeleteMessage,
  onSendMessage 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleReaction = (messageId: string, reaction: string, active: boolean) => {
    console.log(`Message ${messageId} received ${reaction} reaction (${active ? 'added' : 'removed'})`);
    // In a production app, you would save this to the database
  };

  const handleFollowUpClick = (suggestion: string) => {
    if (onSendMessage) {
      onSendMessage(suggestion);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 neural-messages-container">
      {messages.map((message) => (
        <ChatMessage 
          key={message.id} 
          message={message} 
          onReaction={handleReaction}
          onFollowUpClick={onSendMessage ? handleFollowUpClick : undefined}
          onDelete={onDeleteMessage}
        />
      ))}
      
      {isTyping && (
        <div className="message-assistant shadow-sm">
          <div className="flex space-x-2">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce"></div>
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
