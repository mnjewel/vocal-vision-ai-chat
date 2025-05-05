
import React from 'react';

interface RichTextFormatterProps {
  content: string;
}

const RichTextFormatter: React.FC<RichTextFormatterProps> = ({ content }) => {
  // Format content with proper markdown and code blocks
  const formatContent = () => {
    if (!content) return '';

    // Replace code blocks with styled pre elements
    const withCodeBlocks = content.replace(
      /```(\w+)?([\s\S]*?)```/g,
      (_: string, lang: string = '', code: string) => 
        `<pre class="neural-code relative group p-4 bg-gray-100 dark:bg-gray-800/80 rounded-md overflow-auto my-3">
          <div class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="copy-code p-1 rounded-md bg-gray-700/30 hover:bg-gray-700/50 text-gray-200" title="Copy code">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
          <code class="language-${lang}">${code}</code>
        </pre>`
    );

    // Replace inline code
    const withInlineCode = withCodeBlocks.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-200/80 dark:bg-gray-800/80 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
    );

    // Replace headings (##, ###)
    const withHeadings = withInlineCode
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-5 mb-3">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>');

    // Replace bullet points
    const withBullets = withHeadings
      .replace(/^\* (.*$)/gm, '<li class="ml-5 list-disc my-1">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-5 list-disc my-1">$1</li>');

    // Replace numbered lists
    const withNumberedLists = withBullets
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-5 list-decimal my-1">$1</li>');

    // Handle bullet and numbered list wrappers
    const withListWrappers = withNumberedLists
      .replace(/<li class="ml-5 list-disc my-1">(.*?)<\/li>/g, (matchStr: string) => {
        return '<ul class="my-2">'.concat(matchStr, '</ul>');
      })
      .replace(/<li class="ml-5 list-decimal my-1">(.*?)<\/li>/g, (matchStr: string) => {
        return '<ol class="my-2">'.concat(matchStr, '</ol>');
      })
      // Remove duplicate list wrappers
      .replace(/<\/ul><ul class="my-2">/g, '')
      .replace(/<\/ol><ol class="my-2">/g, '');

    // Replace blockquotes
    const withBlockquotes = withListWrappers
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4">$1</blockquote>');

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
          paragraph.startsWith('<h1') ||
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

  React.useEffect(() => {
    // Add event listener for copy code buttons
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

  // Audio feature: Add text-to-speech capability
  const speakText = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content.replace(/```[\s\S]*?```/g, 'Code block excluded'));
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="rich-text-content">
      {/* Audio control */}
      <div className="flex justify-end mb-2">
        <button 
          className="text-xs flex items-center gap-1 text-gray-500 hover:text-primary"
          onClick={speakText}
          title="Listen to this message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
          Listen
        </button>
      </div>

      {/* Rendered content */}
      <div 
        className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:my-2 prose-p:my-1.5 prose-pre:my-2"
        dangerouslySetInnerHTML={{ __html: formatContent() }}
      />
    </div>
  );
};

export default RichTextFormatter;
