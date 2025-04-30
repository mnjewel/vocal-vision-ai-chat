import React, { useRef, useState, KeyboardEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, Image } from 'lucide-react';
import FileUpload from '../FileUpload';
import VoiceInput from '../VoiceInput';
import { hasGroqKey } from '@/integrations/groq/client';

interface MessageInputProps {
  onSendMessage: (message: string, imageUrl?: string) => Promise<void>;
  onFileSelected: (file: File, previewUrl: string) => void;
  uploadedImage: { file: File; url: string } | null;
  isTyping: boolean;
  isSubmitting: boolean;
  streamingResponse: boolean;
  activeAPITab: string;
  showAPIKeyInput: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onFileSelected,
  uploadedImage,
  isTyping,
  isSubmitting,
  streamingResponse,
  activeAPITab,
  showAPIKeyInput
}) => {
  const [inputMessage, setInputMessage] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle key press (Enter to submit)
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle voice transcript
  const handleVoiceTranscript = (transcript: string) => {
    setInputMessage(transcript);
    
    // Auto resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Handle form submission
  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    
    if (inputMessage.trim() || uploadedImage) {
      try {
        await onSendMessage(inputMessage, uploadedImage?.url);
        setInputMessage('');
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="flex-grow neural-glass-strong rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
          <Textarea
            ref={textareaRef}
            placeholder="Send a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="neural-input border-none min-h-[50px] max-h-[200px] resize-none px-4 py-3 focus:ring-0 focus-visible:ring-0 bg-transparent"
            rows={1}
            disabled={
              (activeAPITab === 'groq' && !hasGroqKey() && !showAPIKeyInput) || 
              isSubmitting || 
              streamingResponse
            }
          />
        </div>
        
        <div className="flex items-end gap-2">
          <div className="flex flex-row gap-1.5 h-[50px]">
            <FileUpload onFileSelected={onFileSelected}>
              <Button 
                type="button" 
                className="neural-button-ghost h-[50px] w-[50px] rounded-xl"
                size="icon" 
                variant="ghost"
                disabled={streamingResponse}
              >
                <Image className="h-5 w-5" />
              </Button>
            </FileUpload>
            
            <VoiceInput onTranscriptComplete={handleVoiceTranscript}>
              <Button 
                type="button" 
                className="neural-button-ghost h-[50px] w-[50px] rounded-xl"
                size="icon" 
                variant="ghost"
                disabled={streamingResponse}
              >
                <Mic className="h-5 w-5" />
              </Button>
            </VoiceInput>
          </div>
          
          <Button 
            type="submit" 
            size="icon"
            className="neural-button h-[50px] w-[50px] rounded-xl"
            disabled={
              (!inputMessage.trim() && !uploadedImage) || 
              isTyping || 
              isSubmitting ||
              streamingResponse ||
              (activeAPITab === 'groq' && !hasGroqKey() && !showAPIKeyInput)
            }
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
