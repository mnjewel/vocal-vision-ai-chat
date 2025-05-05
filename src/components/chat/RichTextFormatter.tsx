
import { useEffect, useRef } from 'react';
import { Copy, VolumeX, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

interface RichTextFormatterProps {
  content: string;
}

const RichTextFormatter: React.FC<RichTextFormatterProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  // Function to convert text to speech
  const speakText = () => {
    if (!content) return;
    
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    
    // Use browser's built-in speech synthesis
    const utterance = new SpeechSynthesisUtterance(content.replace(/<[^>]*>?/gm, ''));
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Add event listeners for audio state
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      toast.error("Speech synthesis failed. Please try again.");
    };
    
    // Speak the text
    speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  // Function to copy content to clipboard
  const copyToClipboard = () => {
    if (!containerRef.current) return;
    
    // Get text content without HTML tags
    const textContent = containerRef.current.textContent || '';
    
    navigator.clipboard.writeText(textContent)
      .then(() => {
        toast.success("Content copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy content");
      });
  };

  // Process content for rendering
  const processContent = () => {
    if (!content) return { __html: '' };
    
    // Process markdown-like content
    let processedContent = content
      // Replace headers
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold my-3">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold my-2">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold my-2">$1</h3>')
      
      // Replace links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Replace lists
      .replace(/^\s*\n\*/gim, '<ul>\n*')
      .replace(/^(\*)(.*)/gim, '<li>$2</li>')
      .replace(/^\s*\n\*/gim, '</ul>\n*')
      
      // Replace numbered lists
      .replace(/^\s*\n\d\./gim, '<ol>\n1.')
      .replace(/^(\d\.)(.*)/gim, '<li>$2</li>')
      .replace(/^\s*\n\d\./gim, '</ol>\n1.')
      
      // Replace code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-2 rounded my-2 overflow-x-auto"><code>$1</code></pre>')
      
      // Replace inline code
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</code>')
      
      // Replace bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Replace italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Replace paragraphs (must be last)
      .replace(/\n\s*\n/g, '</p><p class="mb-2">')
      
      // Add line breaks
      .replace(/\n/g, '<br />');
    
    // Wrap in paragraph if not already wrapped
    if (!processedContent.startsWith('<h') && !processedContent.startsWith('<p') && !processedContent.startsWith('<ul') && !processedContent.startsWith('<ol')) {
      processedContent = `<p class="mb-2">${processedContent}</p>`;
    }
    
    return { __html: processedContent };
  };

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (isPlaying) {
        speechSynthesis.cancel();
      }
    };
  }, [isPlaying]);

  return (
    <div className="relative rounded-lg">
      {/* Action buttons */}
      <div className="absolute top-2 right-2 flex space-x-1">
        <button 
          onClick={copyToClipboard}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Copy to clipboard"
        >
          <Copy size={16} />
        </button>
        <button 
          onClick={speakText}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title={isPlaying ? "Stop speaking" : "Listen to text"}
        >
          {isPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Rich text content */}
      <div 
        ref={containerRef}
        className="prose dark:prose-invert max-w-full mt-2 text-sm sm:text-base"
        dangerouslySetInnerHTML={processContent()} 
      />
    </div>
  );
};

export default RichTextFormatter;
