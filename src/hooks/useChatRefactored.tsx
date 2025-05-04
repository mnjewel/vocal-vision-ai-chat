
import { useRef, useEffect } from 'react';
import { MemoryManager } from '@/services/MemoryManager';
import useMessages from './useMessages';
import useSessions from './useSessions';
import usePersona from './usePersona';
import useModelCapabilities from './useModelCapabilities';

export const useChat = () => {
  // Create a ref to store the MemoryManager instance
  const memoryManagerRef = useRef<MemoryManager | null>(null);
  
  // Initialize hooks
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    getCurrentSession,
    updateSessionTitle,
    deleteSession,
    exportConversation,
    forkConversation
  } = useSessions();
  
  const {
    activePersona,
    setActivePersona,
    getAvailablePersonas,
    isPersonaSuitableForModel,
    getSystemPrompt,
    changePersona,
    getCurrentPersona
  } = usePersona();
  
  const {
    getCapabilitiesForModel,
    isAgentic,
    getContextWindowSize,
    supportsImageInput
  } = useModelCapabilities();
  
  // Initialize memory manager when session changes
  useEffect(() => {
    if (currentSessionId) {
      if (!memoryManagerRef.current) {
        memoryManagerRef.current = new MemoryManager(currentSessionId);
        
        // Load messages for the current session
        if (loadSessionMessages) {
          loadSessionMessages(currentSessionId);
        }
      }
    } else {
      // Create a new memory manager with a new session ID if none exists
      const newSessionId = createNewSession();
      if (newSessionId) {
        memoryManagerRef.current = new MemoryManager(newSessionId as unknown as string);
      }
    }
  }, [currentSessionId]);
  
  // Initialize messages hook after memory manager is set up
  const {
    messages,
    isTyping,
    pendingMessage,
    streamingResponse,
    sendMessage: sendMessageInternal,
    deleteMessage,
    updatePendingMessage,
    loadSessionMessages,
  } = useMessages({
    memoryManager: memoryManagerRef.current,
    currentSessionId,
    createNewSession,
    activePersona
  });
  
  // Wrapper for sendMessage to update session title if needed
  const sendMessage = async (content: string, imageUrl?: string, model: string = 'llama-3.3-70b-versatile') => {
    const result = await sendMessageInternal(content, imageUrl, model);
    
    // Update session title if it's a new conversation
    const session = getCurrentSession();
    if (session?.title === 'New Conversation' && content.trim()) {
      const truncatedTitle = content.substring(0, 30) + (content.length > 30 ? '...' : '');
      updateSessionTitle(session.id, truncatedTitle);
    }
    
    return result;
  };
  
  // Wrapper for exportConversation
  const handleExportConversation = () => {
    exportConversation(messages);
  };
  
  // Wrapper for forkConversation
  const handleForkConversation = async () => {
    return await forkConversation(memoryManagerRef.current);
  };
  
  return {
    // Message state and actions
    messages,
    isTyping,
    pendingMessage,
    streamingResponse,
    sendMessage,
    deleteMessage,
    updatePendingMessage,
    
    // Session state and actions
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    getCurrentSession,
    updateSessionTitle,
    deleteSession,
    
    // Persona state and actions
    activePersona,
    setActivePersona,
    getAvailablePersonas,
    isPersonaSuitableForModel,
    getSystemPrompt,
    changePersona,
    getCurrentPersona,
    
    // Model capabilities
    getCapabilitiesForModel,
    isAgentic,
    getContextWindowSize,
    supportsImageInput,
    
    // Conversation actions
    exportConversation: handleExportConversation,
    forkConversation: handleForkConversation
  };
};

export default useChat;
