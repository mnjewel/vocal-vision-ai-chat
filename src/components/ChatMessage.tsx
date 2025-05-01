
import React, { useState } from 'react';
import { Message } from '@/types/chat';
import { Avatar, AvatarFallback } from '@/components/Avatar';
import { motion } from 'framer-motion';
import { Copy, Check, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: Message;
  onDelete?: (id: string) => void;
  id?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onDelete, id: elementId }) => {
  const { id, role, content, timestamp, imageUrl, pending } = message;
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
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
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
      (match: string) => '<pre class="neural-code relative group"><div class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"><button class="copy-code p-1 rounded-md bg-gray-700/30 hover:bg-gray-700/50 text-gray-200" title="Copy code"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg></button></div><code>$2</code></pre>'
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
      .replace(/<li class="ml-5 list-disc my-1">(.*?)<\/li>/g, (match: string) => {
        return '<ul class="my-2">' + match + '</ul>';
      })
      .replace(/<li class="ml-5 list-decimal my-1">(.*?)<\/li>/g, (match: string) => {
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
      .map((paragraph: string) => {
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
      id={elementId}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`p-3 md:p-4 mb-2 shadow-neural rounded-xl ${getMessageClass()}`}
      style={{
        maxWidth: '94%',
        marginLeft: role === 'user' ? 'auto' : undefined,
        marginRight: role === 'assistant' ? 'auto' : undefined
      }}
    >
      <div className="flex items-start">
        <div className="mr-3 flex-shrink-0">
          <Avatar
            className={`ring-2 h-8 w-8 md:h-10 md:w-10 ${
              role === 'assistant'
                ? 'bg-neural-gradient-purple ring-purple-200 dark:ring-purple-900'
                : role === 'user'
                  ? 'bg-neural-gradient-blue ring-blue-200 dark:ring-blue-900'
                  : 'bg-neural-gradient-neutral ring-gray-200 dark:ring-gray-700'
            }`}
          >
            <AvatarFallback className="bg-transparent text-xs md:text-sm font-medium">
              {getIconContent()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-grow">
          <div className="flex flex-wrap items-center justify-between mb-1 gap-1">
            <div className="flex items-center gap-1">
              <span className="font-medium text-xs md:text-sm">
                {role === 'user' ? 'You' : role === 'assistant' ? 'Assistant' : 'System'}
              </span>
              <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400">
                {formatTimestamp(timestamp)}
              </span>
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 md:h-6 md:w-6 p-0.5 opacity-60 hover:opacity-100"
                onClick={handleCopyContent}
              >
                {copied ? <Check className="h-3 w-3 md:h-3.5 md:w-3.5" /> : <Copy className="h-3 w-3 md:h-3.5 md:w-3.5" />}
              </Button>

              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 md:h-6 md:w-6 p-0.5 opacity-60 hover:opacity-100 hover:text-red-500"
                  onClick={handleDeleteMessage}
                >
                  <Trash className="h-3 w-3 md:h-3.5 md:w-3.5" />
                </Button>
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
              className={`prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:my-2 prose-p:my-1.5 prose-pre:my-2 ${
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
