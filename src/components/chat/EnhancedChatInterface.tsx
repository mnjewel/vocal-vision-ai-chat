
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { hasGroqKey } from '@/integrations/groq/client';
import { useAuthContext } from '@/components/AuthProvider';
import { useSettingsStore } from '@/stores/settingsStore';
import useChat from '@/hooks/useChat';
import { ModelManager } from '@/services/ModelManager';

// Import refactored components
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ModelSelector from '../ModelSelector';
import ModelCapabilities from './ModelCapabilities';
import ModelCapabilitiesBanner from './ModelCapabilitiesBanner';
import ConversationActions from './ConversationActions';
import ImagePreview from './ImagePreview';
import ApiKeyInput from './ApiKeyInput';
import SettingsDialog from '../SettingsDialog';

const ChatInterface: React.FC = () => {
  // State from useChat hook
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
  } = useChat();

  // Local state
  const [uploadedImage, setUploadedImage] = useState<{ file: File; url: string } | null>(null);
  const [showAPIKeyInput, setShowAPIKeyInput] = useState<boolean>(!hasGroqKey());
  const [activeAPITab, setActiveAPITab] = useState<string>('groq');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPersonaSelector, setShowPersonaSelector] = useState<boolean>(false);

  // Get user from auth context
  const { user } = useAuthContext();

  // Get settings from store
  const { defaultModel } = useSettingsStore();
  const [selectedModel, setSelectedModel] = useState<string>(defaultModel);

  // Check if model is agentic
  const isAgentic = (model: string): boolean => {
    return ['compound-beta', 'compound-beta-mini'].includes(model);
  };

  // Get available personas for the current model
  const getAvailablePersonas = () => {
    return ModelManager.getAvailablePersonasForModel(selectedModel);
  };

  // Get active capabilities for the current model
  const getActiveCapabilities = () => {
    return ModelManager.getCapabilitiesForModel(selectedModel);
  };

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

  // Handle model change
  const handleModelChange = (model: string) => {
    setSelectedModel(model);

    // Check if current persona is suitable for new model
    if (!ModelManager.isPersonaSuitableForModel(activePersona, model)) {
      // Switch to default persona if not suitable
      const availablePersonas = ModelManager.getAvailablePersonasForModel(model);
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
      return;
    }

    try {
      setIsSubmitting(true);
      await sendMessage(message, imageUrl, selectedModel);
      setUploadedImage(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
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

  return (
    <div className="flex flex-col h-full">
      {/* API Key Input */}
      {(!user || showAPIKeyInput) && (
        <ApiKeyInput onKeySaved={handleKeySaved} />
      )}

      {/* Model Capabilities Banner */}
      <ModelCapabilitiesBanner
        isAgentic={isAgentic(selectedModel)}
        hasApiKey={hasGroqKey()}
        currentPersona={getCurrentPersona()}
        onClearPersona={() => setActivePersona('default')}
      />

      {/* Message List */}
      <MessageList
        messages={messages}
        isTyping={isTyping}
        onDeleteMessage={handleDeleteMessage}
      />

      {/* Image Preview */}
      <ImagePreview
        image={uploadedImage}
        onRemove={() => setUploadedImage(null)}
      />

      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/30">
        {/* Conversation Action Buttons */}
        <div className="flex gap-2 mb-3 justify-between">
          <ConversationActions
            activePersona={activePersona}
            availablePersonas={getAvailablePersonas()}
            onPersonaChange={handlePersonaChange}
            onForkConversation={handleForkConversation}
            onExportConversation={handleExportConversation}
            showPersonaSelector={showPersonaSelector}
            setShowPersonaSelector={setShowPersonaSelector}
          />

          <SettingsDialog />
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
        />
      </div>
    </div>
  );
};

export default ChatInterface;
