import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Brain, 
  Menu,
  Plus,
  Settings,
  X,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

const MobileFriendlyChatInterface: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
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
    setMessages
  } = useChat();

  // Get memory state and actions
  const { 
    memorySnapshots, 
    searchMessages,
    createMemorySnapshot
  } = useMemory({ 
    sessionId: currentSessionId,
    onMessagesLoaded: (loadedMessages) => {
      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
      }
    }
  });

  // Local state
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedImage, setUploadedImage] = useState<{ file: File; url: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [selectedModel, setSelectedModel] = useState(useSettingsStore.getState().defaultModel);
  const [showControls, setShowControls] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  // Get available personas for selected model
  const getAvailablePersonas = () => {
    return ModelManager.getAvailablePersonasForModel(selectedModel);
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
    setShowControls(false);

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

  // Handle search
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = searchMessages(searchQuery);
    setSearchResults(results);
  };

  // Handle jump to message
  const handleJumpToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth' });
      // Highlight the message temporarily
      messageElement.classList.add('highlight-message');
      setTimeout(() => {
        messageElement.classList.remove('highlight-message');
      }, 2000);
    }
    setShowSearch(false);
  };

  // Get current persona
  const getCurrentPersona = () => {
    return getAvailablePersonas().find(p => p.id === activePersona) || getAvailablePersonas()[0];
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-2 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="h-9 w-9"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          {showSearch ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-muted/50 border border-border/50 rounded-full px-3 py-1 text-sm w-[180px] focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowSearch(false)}
                className="h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowSearch(true)}
                className="h-8 w-8"
              >
                <Search className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                className="h-8 gap-1.5 px-2"
              >
                <span className="text-sm font-medium">
                  {getCurrentPersona().name}
                </span>
                {showControls ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Controls Panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[53px] left-0 right-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 px-4 py-3"
          >
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Model
                </label>
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={handleModelChange}
                  compact={true}
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Persona
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {getAvailablePersonas().slice(0, 4).map(persona => (
                    <Button
                      key={persona.id}
                      variant={activePersona === persona.id ? "default" : "outline"}
                      size="sm"
                      className="h-8 justify-start gap-1.5"
                      onClick={() => handlePersonaChange(persona.id)}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        persona.id === 'researcher' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' :
                        persona.id === 'coder' ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' :
                        persona.id === 'analyst' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                      </div>
                      <span className="text-xs">{persona.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <AnimatePresence>
        {showSearch && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[53px] left-0 right-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/50 p-4 max-h-[50vh] overflow-y-auto"
          >
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Search Results</h3>
              {searchResults.map(message => (
                <div 
                  key={message.id}
                  className="p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                  onClick={() => handleJumpToMessage(message.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      message.role === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' :
                      message.role === 'assistant' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {message.role === 'user' ? 'U' : message.role === 'assistant' ? 'A' : 'S'}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{message.content}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto pt-[60px] pb-[80px] px-3 space-y-3 neural-messages-container">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-primary/70" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Welcome to Vocal Vision AI</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Ask me anything or try one of these examples:
            </p>
            <div className="space-y-2 w-full max-w-md">
              {[
                "Explain quantum computing in simple terms",
                "Write a short poem about technology",
                "What are the best practices for responsive web design?"
              ].map((example, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4"
                  onClick={() => {
                    setInputMessage(example);
                    setTimeout(() => textareaRef.current?.focus(), 100);
                  }}
                >
                  <span className="line-clamp-1">{example}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onDelete={message.role !== 'system' ? handleDeleteMessage : undefined}
              id={`message-${message.id}`}
            />
          ))
        )}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl rounded-bl-sm message-assistant animate-pulse-gentle shadow-neural"
          >
            <div className="flex">
              <div className="mr-3 flex-shrink-0">
                <Avatar
                  className="bg-neural-gradient-purple ring-2 ring-purple-200 dark:ring-purple-900 h-8 w-8"
                >
                  <AvatarFallback className="bg-transparent text-xs font-medium">AI</AvatarFallback>
                </Avatar>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium mr-2">Assistant</span>
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
                    <Brain className="w-4 h-4" />
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
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border/50 p-3">
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
            <div className="flex-grow neural-glass-strong rounded-full overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 transition-shadow">
              <Textarea
                ref={textareaRef}
                placeholder="Message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="neural-input border-none min-h-[40px] max-h-[120px] resize-none px-4 py-2 focus:ring-0 focus-visible:ring-0 bg-transparent"
                rows={1}
                disabled={isSubmitting || streamingResponse}
              />
            </div>

            <div className="flex items-end gap-1.5">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    className="neural-button-ghost h-[40px] w-[40px] rounded-full"
                    size="icon"
                    variant="ghost"
                    disabled={streamingResponse}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" className="w-auto p-2">
                  <div className="flex gap-1">
                    <FileUpload onFileSelected={handleFileSelected}>
                      <Button
                        type="button"
                        className="neural-button-ghost h-[40px] w-[40px] rounded-full"
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
                        className="neural-button-ghost h-[40px] w-[40px] rounded-full"
                        size="icon"
                        variant="ghost"
                        disabled={streamingResponse}
                      >
                        <Mic className="h-5 w-5" />
                      </Button>
                    </VoiceInput>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                type="submit"
                size="icon"
                className="neural-button h-[40px] w-[40px] rounded-full"
                disabled={
                  (!inputMessage.trim() && !uploadedImage) ||
                  isTyping ||
                  isSubmitting ||
                  streamingResponse ||
                  (!hasGroqKey() && !user)
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

export default MobileFriendlyChatInterface;
