
import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { SendHorizontal, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSendMessage: (message: string, imageUrl?: string) => void;
  onFileSelected?: (file: File, previewUrl: string) => void;
  uploadedImage?: { file: File; url: string } | null;
  isTyping?: boolean;
  isSubmitting?: boolean;
  streamingResponse?: boolean;
  activeAPITab?: string;
  showAPIKeyInput?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onFileSelected,
  uploadedImage,
  isTyping = false,
  isSubmitting = false,
  streamingResponse = false,
  activeAPITab = 'groq',
  showAPIKeyInput = false,
  value = '',
  onChange
}) => {
  const [message, setMessage] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update local state when value prop changes
  useEffect(() => {
    if (value !== message) {
      setMessage(value);
    }
  }, [value]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (message.trim() === '' && !uploadedImage) return;
    
    onSendMessage(message, uploadedImage?.url);
    setMessage('');
    
    // Also update parent component's state if onChange handler is provided
    if (onChange) {
      onChange('');
    }
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Update parent component's state if onChange handler is provided
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSubmitting && !isTyping && message.trim() !== '') {
        onSendMessage(message, uploadedImage?.url);
        setMessage('');
        
        // Also update parent component's state if onChange handler is provided
        if (onChange) {
          onChange('');
        }
      }
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!onFileSelected) return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        onFileSelected(file, event.target.result);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset the input value so the same file can be uploaded again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);
  
  // Disable input while streaming response
  const isInputDisabled = isSubmitting || (streamingResponse && activeAPITab === 'groq') || showAPIKeyInput;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative flex items-center">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={isInputDisabled ? "Please wait..." : "Type your message..."}
          className="pr-24 resize-none min-h-[40px] max-h-[150px] py-3 rounded-md"
          disabled={isInputDisabled}
          rows={1}
        />
        
        {!isInputDisabled && onFileSelected && (
          <>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload} 
              disabled={isInputDisabled} 
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-12 top-1/2 transform -translate-y-1/2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isInputDisabled}
            >
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </Button>
          </>
        )}
        
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          disabled={isInputDisabled || (message.trim() === '' && !uploadedImage)}
        >
          <SendHorizontal className={`h-5 w-5 ${message.trim() !== '' || uploadedImage ? 'text-primary' : 'text-muted-foreground'}`} />
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;
