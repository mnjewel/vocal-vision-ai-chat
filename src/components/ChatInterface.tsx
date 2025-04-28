
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Settings } from 'lucide-react';
import ChatMessage from './ChatMessage';
import VoiceInput from './VoiceInput';
import FileUpload from './FileUpload';
import ModelSelector from './ModelSelector';
import useChat from '@/hooks/useChat';
import APIKeyInput from './APIKeyInput';
import { hasOpenAIKey, removeOpenAIKey, hasGroqKey, removeGroqKey } from '@/integrations/openai/client';
import { useAuthContext } from './AuthProvider';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ChatInterface: React.FC = () => {
  const {
    messages,
    isTyping,
    pendingMessage,
    sendMessage,
    updatePendingMessage,
  } = useChat();
  
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [uploadedImage, setUploadedImage] = useState<{ file: File; url: string } | null>(null);
  const [showAPIKeyInput, setShowAPIKeyInput] = useState(!hasOpenAIKey() && !hasGroqKey());
  const [activeAPITab, setActiveAPITab] = useState<string>('openai');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuthContext();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [inputMessage]);

  // Check selected model type
  useEffect(() => {
    const isGroqModel = ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'].includes(selectedModel);
    setActiveAPITab(isGroqModel ? 'groq' : 'openai');
  }, [selectedModel]);

  // Handle message submission
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const isGroqModel = ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'].includes(selectedModel);
    
    if ((isGroqModel && !hasGroqKey()) || (!isGroqModel && !hasOpenAIKey())) {
      setShowAPIKeyInput(true);
      return;
    }
    
    if (inputMessage.trim() || uploadedImage) {
      sendMessage(inputMessage, uploadedImage?.url, selectedModel);
      setInputMessage('');
      setUploadedImage(null);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Handle file upload
  const handleFileSelected = (file: File, previewUrl: string) => {
    setUploadedImage({ file, url: previewUrl });
  };

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle voice transcript
  const handleVoiceTranscript = (transcript: string) => {
    setInputMessage(transcript);
    setTimeout(() => handleSubmit(), 500);
  };
  
  // Handle model change
  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };
  
  // Handle API key saved
  const handleKeySaved = () => {
    setShowAPIKeyInput(false);
  };
  
  // Handle API key reset
  const handleResetOpenAIKey = () => {
    removeOpenAIKey();
    setActiveAPITab('openai');
    setShowAPIKeyInput(true);
  };
  
  const handleResetGroqKey = () => {
    removeGroqKey();
    setActiveAPITab('groq');
    setShowAPIKeyInput(true);
  };

  return (
    <div className="flex flex-col h-full">
      {(!user || showAPIKeyInput) && (
        <div className="mx-4 mt-4">
          <APIKeyInput 
            onKeySaved={handleKeySaved} 
          />
        </div>
      )}
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="p-4 mb-2 rounded-md message-assistant animate-pulse-gentle">
            <div className="flex">
              <div className="mr-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-w3j-secondary flex items-center justify-center text-white">
                  AI
                </div>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <span className="font-medium mr-2">W3J Assistant</span>
                  <span className="text-xs text-gray-500">typing...</span>
                </div>
                <div className="h-4 w-24 bg-gradient-to-r from-w3j-secondary to-w3j-secondary/30 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {uploadedImage && (
        <div className="m-4 p-2 border rounded-md bg-muted/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Image attached</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setUploadedImage(null)}
              className="h-6 w-6 p-0"
            >
              &times;
            </Button>
          </div>
          <img 
            src={uploadedImage.url} 
            alt="Upload preview" 
            className="h-24 object-contain rounded-md"
          />
        </div>
      )}
      
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex gap-2 items-center justify-between">
            <ModelSelector 
              selectedModel={selectedModel}
              onSelectModel={handleModelChange}
            />
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60">
                <div className="space-y-4">
                  <h4 className="font-medium leading-none">Settings</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure your chat assistant
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetOpenAIKey}
                      className="w-full"
                    >
                      Reset OpenAI Key
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetGroqKey}
                      className="w-full"
                    >
                      Reset Groq Key
                    </Button>
                    
                    <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                      <p className="mb-1"><strong>Coming Soon:</strong></p>
                      <p>• Web Search</p>
                      <p>• Document Upload</p>
                      <p>• Custom Instructions</p>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              placeholder="Send a message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-grow resize-none min-h-[44px] max-h-[200px]"
              rows={1}
              disabled={
                (activeAPITab === 'openai' && !hasOpenAIKey() && !showAPIKeyInput) || 
                (activeAPITab === 'groq' && !hasGroqKey() && !showAPIKeyInput)
              }
            />
            
            <div className="flex flex-col gap-2">
              <FileUpload onFileSelected={handleFileSelected} />
              <VoiceInput onTranscriptComplete={handleVoiceTranscript} />
              <Button 
                type="submit" 
                size="icon" 
                disabled={
                  (!inputMessage.trim() && !uploadedImage) || 
                  isTyping || 
                  (activeAPITab === 'openai' && !hasOpenAIKey() && !showAPIKeyInput) || 
                  (activeAPITab === 'groq' && !hasGroqKey() && !showAPIKeyInput)
                }
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
