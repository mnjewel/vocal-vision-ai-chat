
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Search, Code, Settings, Plus, Mic, Image } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';

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
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-4 neural-glass rounded-lg shadow-neural"
        >
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
            API Key Required
          </div>
        </motion.div>
      )}
      
      {isAgentic(selectedModel) && hasGroqKey() && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-4 mt-2 p-4 neural-glass rounded-lg border border-amber-200/50 dark:border-amber-700/30 shadow-neural"
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1.5 bg-amber-100/80 dark:bg-amber-900/30 rounded-full">
              <Search className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="p-1.5 bg-amber-100/80 dark:bg-amber-900/30 rounded-full">
              <Code className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="font-medium text-amber-800 dark:text-amber-300">Agentic Assistant Enabled</span>
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            This model can search the web and execute code to answer your questions.
            Try asking about current events, weather, calculations, or code examples.
          </p>
        </motion.div>
      )}
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4 neural-messages-container">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 mb-2 rounded-xl rounded-bl-sm message-assistant animate-pulse-gentle shadow-neural"
          >
            <div className="flex">
              <div className="mr-3 flex-shrink-0">
                <Avatar 
                  className="bg-neural-gradient-purple ring-2 ring-purple-200 dark:ring-purple-900"
                >
                  <AvatarFallback className="bg-transparent text-sm font-medium">AI</AvatarFallback>
                </Avatar>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <span className="font-medium mr-2">W3J Assistant</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">typing...</span>
                </div>
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse-gentle"></div>
                  <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse-gentle" style={{ animationDelay: "0.2s" }}></div>
                  <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse-gentle" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <AnimatePresence>
        {uploadedImage && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="m-4 p-3 neural-glass rounded-lg shadow-neural"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Image attached</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setUploadedImage(null)}
                className="h-6 w-6 p-0 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded-full"
              >
                <span className="sr-only">Remove</span>
                &times;
              </Button>
            </div>
            <div className="rounded-md overflow-hidden border border-gray-200/50 dark:border-gray-700/30">
              <img 
                src={uploadedImage.url} 
                alt="Upload preview" 
                className="h-24 object-contain w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/30">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
                        <Badge variant="outline" className="bg-blue-50/80 dark:bg-blue-900/30 text-xs border-blue-200/50 dark:border-blue-700/30">
                          <Search className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-400" />
                          Web
                        </Badge>
                        <Badge variant="outline" className="bg-green-50/80 dark:bg-green-900/30 text-xs border-green-200/50 dark:border-green-700/30">
                          <Code className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
                          Code
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">This model can search the web and run code</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            <SettingsDialog />
          </div>
          
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
                  (activeAPITab === 'groq' && !hasGroqKey() && !showAPIKeyInput)
                }
              />
            </div>
            
            <div className="flex items-end gap-2">
              <div className="flex flex-row gap-1.5 h-[50px]">
                <FileUpload onFileSelected={handleFileSelected}>
                  <Button 
                    type="button" 
                    className="neural-button-ghost h-[50px] w-[50px] rounded-xl"
                    size="icon" 
                    variant="ghost"
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
                  (activeAPITab === 'groq' && !hasGroqKey() && !showAPIKeyInput)
                }
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
