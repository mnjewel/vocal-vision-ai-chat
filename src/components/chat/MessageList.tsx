import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/Avatar';
import ChatMessage from '../ChatMessage';
import { Message } from '@/hooks/useChat';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  onDeleteMessage: (id: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, onDeleteMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 neural-messages-container">
      {messages.map((message) => (
        <ChatMessage 
          key={message.id} 
          message={message} 
          onDelete={message.role !== 'system' ? onDeleteMessage : undefined}
        />
      ))}
      
      {isTyping && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 mb-2 rounded-xl rounded-bl-sm message-assistant animate-pulse-gentle shadow-neural"
        >
          <div className="flex">
            <div className="mr-3 flex-shrink-0">
              <Avatar 
                className="bg-neural-gradient-purple ring-2 ring-purple-200 dark:ring-purple-900"
              >
                <AvatarFallback className="bg-transparent text-sm font-medium">AI</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <span className="font-medium mr-2">W3J Assistant</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">typing...</span>
              </div>
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse-gentle"></div>
                <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse-gentle typing-dot-1"></div>
                <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse-gentle typing-dot-2"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
