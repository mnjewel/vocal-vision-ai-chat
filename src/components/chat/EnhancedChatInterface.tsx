
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { hasGroqKey } from '@/integrations/groq/client';
import { useSettingsStore } from '@/stores/settingsStore';
import useChat from '@/hooks/useChat';
import useFeedback from '@/hooks/useFeedback';
import { ModelManager } from '@/services/ModelManager';
import { Persona } from '@/types/chat';

// Import refactored components
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ModelSelector from '../ModelSelector';
import ModelCapabilities from './ModelCapabilities';
import ModelCapabilitiesBanner from './ModelCapabilitiesBanner';
import ConversationActions from './ConversationActions';
import ImagePreview from './ImagePreview';
import ApiKeyInput from './ApiKeyInput';
import SettingsDialogEnhanced from '../SettingsDialogEnhanced';
import VoiceConversationPanel from './VoiceConversationPanel';
import ChatMessage from './ChatMessage';

const EnhancedChatInterface: React.FC = () => {
  // Get original hooks
  const {
    messages,
    isTyping,
    sendMessage,
    deleteMessage,
    activePersona,
    setActivePersona,
    forkConversation,
    exportConversation,
    streamingResponse,
    clearConversation,
  } = useChat();

  // Add feedback system hook
  const { submitFeedback } = useFeedback();

  // Local state
  const [uploadedImage, setUploadedImage] = useState<{ file: File; url: string } | null>(null);
  const [showAPIKeyInput, setShowAPIKeyInput] = useState<boolean>(!hasGroqKey());
  const [activeAPITab] = useState<string>('groq');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPersonaSelector, setShowPersonaSelector] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');

  // Get settings from store
  const { defaultModel } = useSettingsStore();
  const [selectedModel, setSelectedModel] = useState<string>(defaultModel);

  // Recheck API key on mount
  useEffect(() => {
    setShowAPIKeyInput(!hasGroqKey());
  }, []);

  // Check if model is agentic
  const isAgentic = (model: string): boolean => {
    return ['compound-beta', 'compound-beta-mini'].includes(model);
  };

  // Get available personas for the current model
  const getAvailablePersonas = (): Persona[] => {
    return ModelManager.getAvailablePersonasForModel(selectedModel);
  };

  // Get active capabilities for the current model
  const getActiveCapabilities = () => {
    return ModelManager.getCapabilitiesForModel(selectedModel);
  };

  // Handle feedback submission
  const handleFeedback = async (messageId: string, isPositive: boolean, comment?: string) => {
    await submitFeedback(messageId, isPositive, comment);
  };

  // Handle model change
  const handleModelChange = (model: string) => {
    setSelectedModel(model);

    // Check if current persona is suitable for new model
    if (!ModelManager.isPersonaSuitableForModel(activePersona, model)) {
      // Switch to default persona if not suitable
      const availablePersonas = getAvailablePersonas();
      if (availablePersonas.length > 0) {
        setActivePersona(availablePersonas[0].id);
        toast.info(`Switched to ${availablePersonas[0].name} persona to match selected model capabilities`);
      }
    }
  };

  // Handle message submission
  const handleSendMessage = async (message: string, imageUrl?: string) => {
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
      toast.error('Please enter your Groq API key to continue');
      return;
    }

    try {
      setIsSubmitting(true);
      await sendMessage(message, imageUrl, selectedModel);
      setUploadedImage(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please check your API key and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file upload
  const handleFileSelected = (file: File, previewUrl: string) => {
    setUploadedImage({ file, url: previewUrl });
  };

  // Handle delete message
  const handleDeleteMessage = (id: string) => {
    deleteMessage(id);
    toast.success('Message deleted');
  };

  // Handle persona change
  const handlePersonaChange = (personaId: string) => {
    setActivePersona(personaId);
    setShowPersonaSelector(false);

    const persona = getAvailablePersonas().find(p => p.id === personaId);
    if (persona) {
      toast.info(`Switched to ${persona.name} persona`);
    }
  };

  // Handle API key saved
  const handleKeySaved = () => {
    setShowAPIKeyInput(false);
    toast.success('API key saved successfully');
  };

  // Handle fork conversation
  const handleForkConversation = async () => {
    await forkConversation();
    toast.success('Conversation forked');
  };

  // Handle export conversation
  const handleExportConversation = () => {
    exportConversation();
    toast.success('Conversation exported');
  };

  // Handle clear conversation
  const handleClearConversation = () => {
    clearConversation();
    toast.success('Conversation cleared');
  };

  // Handle voice transcript ready
  const handleTranscriptReady = (text: string) => {
    setInputValue(text);
  };

  // Get current persona
  const getCurrentPersona = () => {
    const availablePersonas = getAvailablePersonas();

    // Safety check to ensure we have personas
    if (!availablePersonas || availablePersonas.length === 0) {
      // Return a default persona object if no personas are available
      return {
        id: 'default',
        name: 'Default Assistant',
        description: 'General-purpose AI assistant',
        systemPrompt: 'You are a helpful, friendly AI assistant.',
        suitableModels: []
      };
    }

    return availablePersonas.find(p => p.id === activePersona) || availablePersonas[0];
  };

  // Create a render wrapper function for messages that adds feedback functionality
  const renderMessageWithFeedback = (message: any, children: React.ReactNode) => {
    return message.role === 'assistant' ? (
      <ChatMessage
        message={message}
        onFeedback={handleFeedback}
      >
        {children}
      </ChatMessage>
    ) : children;
  };

  return (
    <div className="flex flex-col h-full">
      {/* API Key Input */}
      {showAPIKeyInput && (
        <ApiKeyInput onKeySaved={handleKeySaved} />
      )}

      {/* Model Capabilities Banner */}
      <ModelCapabilitiesBanner
        isAgentic={isAgentic(selectedModel)}
        hasApiKey={hasGroqKey()}
        currentPersona={getCurrentPersona()}
        onClearPersona={() => setActivePersona('default')}
      />

      {/* Message List with Feedback */}
      <div className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages}
          isTyping={isTyping}
          onDeleteMessage={handleDeleteMessage}
          renderMessageWrapper={renderMessageWithFeedback}
        />
      </div>

      {/* Image Preview */}
      <ImagePreview
        image={uploadedImage}
        onRemove={() => setUploadedImage(null)}
      />

      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/30">
        {/* Conversation Action Buttons */}
        <div className="flex gap-2 mb-3 justify-between">
          <div className="flex items-center space-x-1.5">
            <ConversationActions
              activePersona={activePersona}
              availablePersonas={getAvailablePersonas()}
              onPersonaChange={handlePersonaChange}
              onForkConversation={handleForkConversation}
              onExportConversation={handleExportConversation}
              onClearConversation={handleClearConversation}
              showPersonaSelector={showPersonaSelector}
              setShowPersonaSelector={setShowPersonaSelector}
            />
            
            <VoiceConversationPanel onTranscriptReady={handleTranscriptReady} />
          </div>

          <SettingsDialogEnhanced />
        </div>

        {/* Model Selector and Capabilities */}
        <div className="flex gap-2 items-center mb-3">
          <div className="flex-1">
            <ModelSelector
              selectedModel={selectedModel}
              onSelectModel={handleModelChange}
            />
          </div>

          <ModelCapabilities capabilities={getActiveCapabilities()} />
        </div>

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          onFileSelected={handleFileSelected}
          uploadedImage={uploadedImage}
          isTyping={isTyping}
          isSubmitting={isSubmitting}
          streamingResponse={streamingResponse}
          activeAPITab={activeAPITab}
          showAPIKeyInput={showAPIKeyInput}
          value={inputValue}
          onChange={setInputValue}
        />
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
