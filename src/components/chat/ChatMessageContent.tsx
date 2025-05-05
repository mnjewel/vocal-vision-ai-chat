
import React from 'react';
import RichTextFormatter from './RichTextFormatter';
import { Message } from '@/types/chat';

interface ChatMessageContentProps {
  message: Message;
}

const ChatMessageContent: React.FC<ChatMessageContentProps> = ({ message }) => {
  // Only apply rich formatting to assistant messages
  if (message.role === 'assistant') {
    return <RichTextFormatter content={message.content} />;
  }

  // For user and system messages, return simple text
  return <div className="whitespace-pre-wrap">{message.content}</div>;
};

export default ChatMessageContent;
