
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, Search, Code, Settings, Plus, Mic, Image, 
  Split, Download, Hash, Brain, FileText, X
} from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { toast } from '@/components/ui/use-toast';
import { ModelManager } from '@/services/ModelManager';

const ChatInterface: React.FC = () => {
  const {
    messages,
    isTyping,
    pendingMessage,
    sendMessage,
    updatePendingMessage,
    deleteMessage,
    activePersona,
    setActivePersona,
    forkConversation,
    exportConversation,
    streamingResponse,
  } = useChat();
  
  const [inputMessage, setInputMessage] = useState('');
  const { showAgentTools, defaultModel } = useSettingsStore();
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [uploadedImage, setUploadedImage] = useState<{ file: File; url: string } | null>(null);
  const [showAPIKeyInput, setShowAPIKeyInput] = useState(!hasGroqKey());
  const [activeAPITab, setActiveAPITab] = useState<string>('groq');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  
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

  // Get available capabilities for selected model
  const getActiveCapabilities = () => {
    return ModelManager.getCapabilitiesForModel(selectedModel);
  };

  // Get available personas for selected model
  const getAvailablePersonas = () => {
    return ModelManager.getAvailablePersonasForModel(selectedModel);
  };

  // Handle message deletion
  const handleDeleteMessage = (id: string) => {
    if (deleteMessage) {
      deleteMessage(id);
      toast({ description: "Message deleted" });
    }
  };

  // Handle message submission
  const handleSubmit = async (e?: React.FormEvent) => {
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
      try {
        setIsSubmitting(true);
        await sendMessage(inputMessage, uploadedImage?.url, selectedModel);
        setInputMessage('');
        setUploadedImage(null);
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        toast({ 
          variant: "destructive",
          title: "Error",
          description: "Failed to send message. Please try again."
        });
      } finally {
        setIsSubmitting(false);
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
    
    // Check if current persona is suitable for new model
    if (!ModelManager.isPersonaSuitableForModel(activePersona, model)) {
      // Switch to default persona if not suitable
      const availablePersonas = ModelManager.getAvailablePersonasForModel(model);
      if (availablePersonas.length > 0) {
        setActivePersona(availablePersonas[0].id);
        toast({
          description: `Switched to ${availablePersonas[0].name} persona to match selected model capabilities`,
        });
      }
    }
  };
  
  // Handle persona change
  const handlePersonaChange = (personaId: string) => {
    setActivePersona(personaId);
    setShowPersonaSelector(false);
    
    const persona = ModelManager.MODEL_PERSONAS.find(p => p.id === personaId);
    if (persona) {
      toast({
        description: `Switched to ${persona.name} persona`,
      });
    }
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
  
  // Handle fork conversation
  const handleForkConversation = async () => {
    await forkConversation();
  };
  
  // Handle export conversation
  const handleExportConversation = () => {
    exportConversation();
  };
  
  // Get current persona
  const getCurrentPersona = () => {
    return ModelManager.MODEL_PERSONAS.find(p => p.id === activePersona) || ModelManager.MODEL_PERSONAS[0];
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
      
      {/* Model Capabilities Banner */}
      <AnimatePresence>
        {isAgentic(selectedModel) && hasGroqKey() && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5, height: 0 }}
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
      </AnimatePresence>
      
      {/* Active Persona Indicator */}
      <AnimatePresence>
        {getCurrentPersona().id !== 'default' && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-4 mt-2 p-3 neural-glass rounded-lg border border-blue-200/50 dark:border-blue-700/30 shadow-neural"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100/80 dark:bg-blue-900/30 rounded-full">
                  <Brain className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium text-blue-800 dark:text-blue-300">
                  {getCurrentPersona().name} Active
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActivePersona('default')}
                className="h-6 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100/50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4 neural-messages-container">
        {messages.map((message) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            onDelete={message.role !== 'system' ? handleDeleteMessage : undefined}
          />
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
      
      {/* Persona Selector Popover */}
      <Popover open={showPersonaSelector} onOpenChange={setShowPersonaSelector}>
        <PopoverContent className="w-72 p-0" side="top">
          <div className="p-3 border-b">
            <h3 className="text-sm font-medium">Select Persona</h3>
            <p className="text-xs text-muted-foreground">Choose how the assistant behaves</p>
          </div>
          <div className="py-2 max-h-60 overflow-y-auto">
            {getAvailablePersonas().map(persona => (
              <button
                key={persona.id}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  activePersona === persona.id ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                }`}
                onClick={() => handlePersonaChange(persona.id)}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    persona.id === 'researcher' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' :
                    persona.id === 'coder' ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' :
                    persona.id === 'analyst' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {persona.id === 'researcher' && <FileText className="w-4 h-4" />}
                    {persona.id === 'coder' && <Code className="w-4 h-4" />}
                    {persona.id === 'analyst' && <Hash className="w-4 h-4" />}
                    {persona.id === 'default' && <Brain className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{persona.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{persona.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/30">
        {/* Conversation Action Buttons */}
        <div className="flex gap-2 mb-3 justify-between">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={() => setShowPersonaSelector(true)}
                  >
                    <Brain className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{getCurrentPersona().id === 'default' ? 'Personas' : getCurrentPersona().name}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select assistant persona</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5"
                      onClick={handleForkConversation}
                    >
                      <Split className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Fork</span>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a branch of this conversation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={handleExportConversation}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export conversation as JSON</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <SettingsDialog />
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <ModelSelector 
                selectedModel={selectedModel}
                onSelectModel={handleModelChange}
              />
            </div>
            
            <div className="flex items-center gap-2">
              {getActiveCapabilities().map(capability => (
                <TooltipProvider key={capability.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${capability.id === 'web_search' ? 'bg-blue-50/80 dark:bg-blue-900/30 text-xs border-blue-200/50 dark:border-blue-700/30' : 
                           capability.id === 'code_execution' ? 'bg-green-50/80 dark:bg-green-900/30 text-xs border-green-200/50 dark:border-green-700/30' :
                           'bg-purple-50/80 dark:bg-purple-900/30 text-xs border-purple-200/50 dark:border-purple-700/30'
                          }
                        `}
                      >
                        {capability.id === 'web_search' && <Search className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-400" />}
                        {capability.id === 'code_execution' && <Code className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />}
                        {capability.id === 'long_context' && <FileText className="h-3 w-3 mr-1 text-purple-600 dark:text-purple-400" />}
                        {capability.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{capability.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
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
                  (activeAPITab === 'groq' && !hasGroqKey() && !showAPIKeyInput) || 
                  isSubmitting || 
                  streamingResponse
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
      </div>
    </div>
  );
};

export default ChatInterface;
