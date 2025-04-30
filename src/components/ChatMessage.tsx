
import React, { useState } from 'react';
import { Message } from '@/hooks/useChat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { motion } from 'framer-motion';
import { Copy, Check, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';

interface ChatMessageProps {
  message: Message;
  onDelete?: (id: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onDelete }) => {
  const { id, role, content, timestamp, imageUrl, pending, model } = message;
  const [copied, setCopied] = useState(false);
  
  const getMessageClass = () => {
    if (role === 'user') return 'message-user rounded-2xl rounded-br-sm';
    if (role === 'assistant') return 'message-assistant rounded-2xl rounded-bl-sm';
    return 'message-system rounded-2xl';
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
  
  const handleCopyContent = () => {
    if (!content) return;
    
    navigator.clipboard.writeText(content)
      .then(() => {
        setCopied(true);
        toast({ description: "Message copied to clipboard" });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        toast({ 
          variant: "destructive", 
          description: "Failed to copy message" 
        });
      });
  };
  
  const handleDeleteMessage = () => {
    if (onDelete) {
      onDelete(id);
    }
  };
  
  // Format content with proper markdown and code blocks
  const formatContent = () => {
    if (!content) return '';
    
    // Replace code blocks with styled pre elements
    const withCodeBlocks = content.replace(
      /```(\w+)?([\s\S]*?)```/g, 
      '<pre class="neural-code relative group"><div class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"><button class="copy-code p-1 rounded-md bg-gray-700/30 hover:bg-gray-700/50 text-gray-200" title="Copy code"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button></div><code>$2</code></pre>'
    );
    
    // Replace inline code
    const withInlineCode = withCodeBlocks.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-200/80 dark:bg-gray-800/80 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
    );
    
    // Replace headings (##, ###)
    const withHeadings = withInlineCode
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-5 mb-3">$1</h2>');
    
    // Replace bullet points
    const withBullets = withHeadings
      .replace(/^\* (.*$)/gm, '<li class="ml-5 list-disc my-1">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-5 list-disc my-1">$1</li>');
      
    // Replace numbered lists
    const withNumberedLists = withBullets
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-5 list-decimal my-1">$1</li>');
    
    // Handle bullet and numbered list wrappers
    const withListWrappers = withNumberedLists
      .replace(/<li class="ml-5 list-disc my-1">(.*?)<\/li>/g, (match) => {
        return '<ul class="my-2">' + match + '</ul>';
      })
      .replace(/<li class="ml-5 list-decimal my-1">(.*?)<\/li>/g, (match) => {
        return '<ol class="my-2">' + match + '</ol>';
      })
      // Remove duplicate list wrappers
      .replace(/<\/ul><ul class="my-2">/g, '')
      .replace(/<\/ol><ol class="my-2">/g, '');
    
    // Replace blockquotes
    const withBlockquotes = withListWrappers
      .replace(/^> (.*$)/gm, '<blockquote class="neural-quote">$1</blockquote>');
    
    // Replace bold text
    const withBold = withBlockquotes
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/__(.*?)__/g, '<strong class="font-semibold">$1</strong>');
    
    // Replace italic text
    const withItalic = withBold
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/_(.*?)_/g, '<em class="italic">$1</em>');
    
    // Add links
    const withLinks = withItalic
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Replace paragraphs with proper spacing
    return withLinks
      .split('\n\n')
      .map(paragraph => {
        if (
          paragraph.startsWith('<pre') || 
          paragraph.startsWith('<h2') || 
          paragraph.startsWith('<h3') || 
          paragraph.startsWith('<ul') || 
          paragraph.startsWith('<ol') || 
          paragraph.startsWith('<blockquote')
        ) {
          return paragraph;
        }
        return `<p class="mb-3 last:mb-0">${paragraph}</p>`;
      })
      .join('');
  };

  // Add event listener for copy code buttons
  React.useEffect(() => {
    const copyButtons = document.querySelectorAll('.copy-code');
    const handleClick = function(this: HTMLElement, e: Event) {
      e.preventDefault();
      e.stopPropagation();
      
      const preElement = this.closest('pre');
      if (preElement) {
        const codeElement = preElement.querySelector('code');
        if (codeElement) {
          navigator.clipboard.writeText(codeElement.textContent || '')
            .then(() => {
              this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
              setTimeout(() => {
                this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
              }, 2000);
            })
            .catch(console.error);
        }
      }
    };
    
    copyButtons.forEach(button => {
      button.addEventListener('click', handleClick);
    });
    
    return () => {
      copyButtons.forEach(button => {
        button.removeEventListener('click', handleClick as EventListener);
      });
    };
  }, [content]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`p-4 md:p-5 mb-3 shadow-neural rounded-xl ${getMessageClass()}`}
      style={{
        maxWidth: '92%',
        marginLeft: role === 'user' ? 'auto' : undefined,
        marginRight: role === 'assistant' ? 'auto' : undefined
      }}
    >
      <div className="flex items-start">
        <div className="mr-3 flex-shrink-0">
          <Avatar 
            className={`ring-2 ${
              role === 'assistant' 
                ? 'bg-neural-gradient-purple ring-purple-200 dark:ring-purple-900' 
                : role === 'user' 
                  ? 'bg-neural-gradient-blue ring-blue-200 dark:ring-blue-900' 
                  : 'bg-neural-gradient-neutral ring-gray-200 dark:ring-gray-700'
            }`}
          >
            <AvatarFallback className="bg-transparent text-sm font-medium">
              {getIconContent()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-grow">
          <div className="flex flex-wrap items-center justify-between mb-1.5 gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm">
                {role === 'user' ? 'You' : role === 'assistant' ? 'W3J Assistant' : 'System'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimestamp(timestamp)}
              </span>
              {model && (
                <span className="text-xs neural-glass px-1.5 py-0.5 rounded-full text-gray-700 dark:text-gray-300">
                  {model}
                </span>
              )}
            </div>
            
            <div className="flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 p-0.5 opacity-60 hover:opacity-100"
                      onClick={handleCopyContent}
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{copied ? "Copied!" : "Copy message"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {onDelete && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 p-0.5 opacity-60 hover:opacity-100 hover:text-red-500"
                        onClick={handleDeleteMessage}
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete message</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <div className={`${pending ? 'opacity-70 neural-typing' : ''}`}>
            {imageUrl && (
              <div className="mb-3">
                <img 
                  src={imageUrl} 
                  alt="Uploaded content" 
                  className="max-h-64 rounded-md object-contain border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}
            <div 
              className={`prose max-w-none dark:prose-invert prose-headings:my-3 prose-p:my-2 prose-pre:my-3 ${
                pending ? 'typing-indicator' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: formatContent() }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
