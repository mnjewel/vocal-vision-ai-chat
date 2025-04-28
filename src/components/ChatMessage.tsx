
import React from 'react';
import { Message } from '@/hooks/useChat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, content, timestamp, imageUrl, pending, model } = message;
  
  const getMessageClass = () => {
    if (role === 'user') return 'message-user';
    if (role === 'assistant') return 'message-assistant';
    return 'message-system';
  };
  
  const getIconContent = () => {
    if (role === 'user') return 'U';
    if (role === 'assistant') return 'AI';
    return 'SYS';
  };
  
  const getAvatarIcon = () => {
    if (role === 'user') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      );
    }
    if (role === 'assistant') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M12 2a8 8 0 0 0-8 8v12l6.5-6.5H12a8 8 0 0 0 0-16z"></path>
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 8v4"></path>
        <path d="M12 16h.01"></path>
      </svg>
    );
  };
  
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };
  
  // Format content with proper markdown and code blocks
  const formatContent = () => {
    if (!content) return '';
    
    // This is a very simple formatting implementation
    // Replace code blocks with styled pre elements
    const withCodeBlocks = content.replace(
      /```(\w+)?([\s\S]*?)```/g, 
      '<pre class="bg-gray-800 text-white p-3 rounded-md my-2 overflow-x-auto">$2</pre>'
    );
    
    // Replace headings (##, ###)
    const withHeadings = withCodeBlocks
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-3 mb-1">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>');
    
    // Replace bullet points
    const withBullets = withHeadings
      .replace(/^\* (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>');
      
    // Replace numbered lists
    const withNumberedLists = withBullets
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>');
    
    // Replace bold text
    const withBold = withNumberedLists
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Replace italic text
    const withItalic = withBold
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Replace paragraphs with proper spacing
    return withItalic
      .split('\n\n')
      .map(paragraph => `<div class="mb-3">${paragraph}</div>`)
      .join('');
  };

  return (
    <div className={`p-4 mb-2 rounded-md animate-message-appear ${getMessageClass()}`}>
      <div className="flex">
        <div className="mr-3 flex-shrink-0">
          <Avatar className={role === 'assistant' ? 'bg-w3j-secondary' : role === 'user' ? 'bg-w3j-primary' : 'bg-gray-500'}>
            <AvatarFallback>{getIconContent()}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-grow">
          <div className="flex items-center mb-1">
            <span className="font-medium mr-2">
              {role === 'user' ? 'You' : role === 'assistant' ? 'W3J Assistant' : 'System'}
            </span>
            <span className="text-xs text-gray-500">
              {formatTimestamp(timestamp)}
            </span>
            {model && (
              <span className="text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded ml-2">
                {model}
              </span>
            )}
          </div>
          <div className={pending ? 'opacity-70' : ''}>
            {imageUrl && (
              <div className="mb-2">
                <img 
                  src={imageUrl} 
                  alt="Uploaded content" 
                  className="max-h-64 rounded-md object-contain"
                />
              </div>
            )}
            <div 
              className={`prose max-w-none dark:prose-invert ${pending ? 'typing-indicator' : ''}`}
              dangerouslySetInnerHTML={{ __html: formatContent() }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
