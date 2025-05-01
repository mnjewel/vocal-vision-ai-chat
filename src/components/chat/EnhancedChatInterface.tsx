import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Brain, 
  GitBranch, 
  Download, 
  Search,
  Code,
  Hash,
  FileText,
  X,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { useSettingsStore } from '@/stores/settingsStore';
import { hasGroqKey } from '@/integrations/groq/client';
import { useAuthContext } from '@/components/AuthProvider';
import { ModelManager } from '@/services/ModelManager';
import useChat from '@/hooks/useChat';
import useMemory from '@/hooks/useMemory';
import ChatMessage from '@/components/ChatMessage';
import VoiceInput from '@/components/VoiceInput';
import FileUpload from '@/components/FileUpload';
import ModelSelector from '@/components/ModelSelector';
import SettingsDialog from '@/components/SettingsDialog';
import ChatTimeline from './ChatTimeline';

const EnhancedChatInterface: React.FC = () => {
  // Get chat state and actions from hooks
  const {
    messages,
    isTyping,
    streamingResponse,
    sendMessage,
    deleteMessage,
    currentSessionId,
    activePersona,
    setActivePersona,
    exportConversation,
    forkConversation,
  } = useChat();

  // Get memory state and actions
  const { 
    searchMessages,
  } = useMemory({ 
    sessionId: currentSessionId,
    onMessagesLoaded: (loadedMessages) => {
      if (loadedMessages.length > 0) {
        // We no longer need this since setMessages isn't exposed from useChat
        // Handle loaded messages differently if needed
        console.log("Messages loaded:", loadedMessages.length);
      }
    }
  });

  // Local state
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedImage, setUploadedImage] = useState<{ file: File; url: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [selectedModel, setSelectedModel] = useState(useSettingsStore.getState().defaultModel);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auth context
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

  // Fix the handleForkConversation function to return string | null
  const handleForkConversation = async (): Promise<string | null> => {
    try {
      await forkConversation();
      toast({
        description: "Conversation forked successfully",
      });
      return currentSessionId; // Return the current session ID as fallback
    } catch (error) {
      console.error("Error forking conversation:", error);
      return null;
    }
  };

  // Handle message deletion
  const handleDeleteMessage = (id: string) => {
    if (deleteMessage) {
      deleteMessage(id);
    }
  };

  // Handle message submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

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

    const persona = getAvailablePersonas().find(p => p.id === personaId);
    if (persona) {
      toast({
        description: `Switched to ${persona.name} persona`,
      });
    }
  };

  // Handle export conversation
  const handleExportConversation = () => {
    exportConversation();
  };

  // Get current persona
  const getCurrentPersona = () => {
    return ModelManager.getAvailablePersonasForModel(selectedModel).find(p => p.id === activePersona) || ModelManager.getAvailablePersonasForModel(selectedModel)[0];
  };

  // Get available personas for the current model
  const getAvailablePersonasForModel = () => {
    return ModelManager.getAvailablePersonasForModel(selectedModel);
  };

  return (
    <div className="flex flex-col h-full">
      {/* API Key Warning */}
      {(!user || !hasGroqKey()) && (
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
        {ModelManager.isAgentic(selectedModel) && hasGroqKey() && (
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
              <div className="p-1.5 bg-amber-100/80 dark:bg-amber-900/30 rounded-full">
                <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Agentic Model Capabilities
              </span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-300 mb-2">
              This model can use tools to search the web, analyze data, and generate code.
            </p>
            <div className="flex justify-end">
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

      {/* Chat Timeline */}
      <ChatTimeline 
        messages={messages}
        memorySnapshots={[]} // Fix empty memorySnapshots
        branches={[]} // Fix empty branches
        onSearchMessages={searchMessages}
        onJumpToMessage={(id) => {
          const messageElement = document.getElementById(`message-${id}`);
          if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onCreateBranch={handleForkConversation}
      />

      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 neural-messages-container">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onDelete={message.role !== 'system' ? handleDeleteMessage : undefined}
            id={`message-${message.id}`}
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
                  <span className="font-medium mr-2">Assistant</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">typing...</span>
                </div>
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse-gentle"></div>
                  <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse-gentle delay-150"></div>
                  <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse-gentle delay-300"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Persona Selector Popover */}
      <Popover open={showPersonaSelector} onOpenChange={setShowPersonaSelector}>
        <PopoverContent className="w-72 p-0" side="top">
          <div className="p-3 border-b">
            <h3 className="text-sm font-medium">Select Persona</h3>
            <p className="text-xs text-muted-foreground">Choose how the assistant behaves</p>
          </div>
          <div className="py-2 max-h-60 overflow-y-auto">
            {ModelManager.getAvailablePersonasForModel(selectedModel).map(persona => (
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
                    <div className="text-xs text-muted-foreground">{persona.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Input Form */}
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

            <ModelSelector
              selectedModel={selectedModel}
              onSelectModel={handleModelChange}
            />
          </div>

          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
                    onClick={handleForkConversation}
                  >
                    <GitBranch className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Fork</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create a new branch from this conversation</p>
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
                  <p>Export conversation as markdown</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <SettingsDialog />
          </div>
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="relative">
          {uploadedImage && (
            <div className="absolute bottom-full mb-2 left-0 p-2 bg-background/80 backdrop-blur-sm rounded-lg border border-border shadow-sm">
              <div className="relative">
                <img 
                  src={uploadedImage.url} 
                  alt="Upload preview" 
                  className="h-20 w-auto rounded object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                  onClick={() => setUploadedImage(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

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
                disabled={isSubmitting || streamingResponse}
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
                    <ImageIcon className="h-5 w-5" />
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
                  streamingResponse
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

export default EnhancedChatInterface;
