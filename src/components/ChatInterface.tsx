import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Settings, Search, Code } from 'lucide-react';
import ChatMessage from './ChatMessage';
import VoiceInput from './VoiceInput';
import FileUpload from './FileUpload';
import ModelSelector from './ModelSelector';
import useChat from '@/hooks/useChat';
import { hasGroqKey, removeGroqKey } from '@/integrations/groq/client';
import { useAuthContext } from './AuthProvider';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SettingsDialog from './SettingsDialog';
import { useSettingsStore } from '@/stores/settingsStore';

const ChatInterface: React.FC = () => {
  const {
    messages,
    isTyping,
    pendingMessage,
    sendMessage,
    updatePendingMessage,
  } = useChat();
  
  const [inputMessage, setInputMessage] = useState('');
  const { showAgentTools, defaultModel } = useSettingsStore();
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [uploadedImage, setUploadedImage] = useState<{ file: File; url: string } | null>(null);
  const [showAPIKeyInput, setShowAPIKeyInput] = useState(!hasGroqKey());
  const [activeAPITab, setActiveAPITab] = useState<string>('groq');
  
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
    const groqModels = [
      'llama3-8b-8192', 
      'llama3-70b-8192',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'gemma2-9b-it',
      'deepseek-r1-distill-llama-70b',
      'compound-beta',
      'compound-beta-mini'
    ];
    setActiveAPITab(groqModels.includes(selectedModel) ? 'groq' : 'openai');
  }, [selectedModel]);

  // Check if selected model is agentic
  const isAgentic = (model: string): boolean => {
    return ['compound-beta', 'compound-beta-mini'].includes(model);
  };

  // Handle message submission
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const groqModels = [
      'llama3-8b-8192', 
      'llama3-70b-8192',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'gemma2-9b-it',
      'deepseek-r1-distill-llama-70b',
      'compound-beta',
      'compound-beta-mini'
    ];
    
    const isGroqModel = groqModels.includes(selectedModel);
    
    if ((isGroqModel && !hasGroqKey())) {
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
  
  const handleResetGroqKey = () => {
    removeGroqKey();
    setActiveAPITab('groq');
    setShowAPIKeyInput(true);
  };

  return (
    <div className="flex flex-col h-full">
      {(!user || showAPIKeyInput) && (
        <div className="mx-4 mt-4">
          API Key Required
        </div>
      )}
      
      {isAgentic(selectedModel) && hasGroqKey() && (
        <div className="mx-4 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <Search className="h-4 w-4 text-amber-600" />
            <Code className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-amber-800">Agentic Assistant Enabled</span>
          </div>
          <p className="text-sm text-amber-700">
            This model can search the web and execute code to answer your questions.
            Try asking about current events, weather, calculations, or code examples.
          </p>
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
            <div className="flex items-center gap-2">
              <ModelSelector 
                selectedModel={selectedModel}
                onSelectModel={handleModelChange}
              />
              
              {isAgentic(selectedModel) && showAgentTools && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="bg-blue-50">
                          <Search className="h-3 w-3 mr-1" />
                          Web
                        </Badge>
                        <Badge variant="outline" className="bg-green-50">
                          <Code className="h-3 w-3 mr-1" />
                          Code
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This model can search the web and run code</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            <SettingsDialog />
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
