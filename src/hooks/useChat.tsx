
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/types/chat';
import { useAuthContext } from '@/components/AuthProvider';
import useMessages from './useMessages';
import { MemoryManager } from '@/services/MemoryManager';
import useSessions from './useSessions';

const useChat = () => {
  // State
  const [memoryManager, setMemoryManager] = useState<MemoryManager | null>(null);
  const [activePersona, setActivePersona] = useState<string>('default');

  // Auth context
  const { user } = useAuthContext();

  // Initialize sessions
  const {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    updateSessionTitle,
    deleteSession,
  } = useSessions();

  // Initialize memory manager
  useEffect(() => {
    const initializeMemoryManager = async () => {
      const manager = new MemoryManager(user?.id);
      setMemoryManager(manager);
    };

    initializeMemoryManager();
  }, [user]);

  // Initialize messages
  const {
    messages,
    isTyping,
    pendingMessage,
    streamingResponse,
    sendMessage,
    deleteMessage,
    updatePendingMessage,
    loadSessionMessages,
    setMessages,
  } = useMessages({
    memoryManager,
    currentSessionId,
    createNewSession,
    activePersona,
  });

  // Load session messages when session changes
  useEffect(() => {
    if (currentSessionId && memoryManager) {
      loadSessionMessages(currentSessionId);
    }
  }, [currentSessionId, memoryManager, loadSessionMessages]);

  // Export conversation
  const exportConversation = useCallback(() => {
    try {
      const conversationData = {
        session: sessions.find(session => session.id === currentSessionId),
        messages: messages.filter(msg => msg.role !== 'system'),
        exportedAt: new Date().toISOString(),
      };

      // Create a Blob with the conversation data
      const blob = new Blob([JSON.stringify(conversationData, null, 2)], { type: 'application/json' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `w3j-assistant-conversation-${currentSessionId?.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting conversation:', error);
    }
  }, [currentSessionId, messages, sessions]);

  // Fork conversation
  const forkConversation = useCallback(async () => {
    if (!currentSessionId) return null;

    try {
      // Create new session
      const newSessionId = await createNewSession();
      if (!newSessionId) {
        throw new Error('Failed to create new session');
      }

      // Create a forked copy of messages for new session
      const messagesToFork = [...messages]
        .filter(msg => msg.role !== 'system' && !msg.pending);

      // Modify messages to have new IDs for new session
      const forkedMessages = messagesToFork.map(msg => ({
        ...msg,
        id: uuidv4(),
      }));

      // Set current session to new one
      setCurrentSessionId(newSessionId);

      // Update memory manager with forked messages
      if (memoryManager) {
        for (const msg of forkedMessages) {
          await memoryManager.saveMessage({
            ...msg,
            sessionId: newSessionId,
          });
        }
      }

      // Update UI with forked messages
      setMessages(forkedMessages);

      return newSessionId;
    } catch (error) {
      console.error('Error forking conversation:', error);
      return null;
    }
  }, [currentSessionId, createNewSession, messages, memoryManager, setCurrentSessionId, setMessages]);

  // Clear conversation
  const clearConversation = useCallback(async () => {
    try {
      // Clear messages in the UI
      setMessages([]);

      // Create a welcome message
      const welcomeMessage: Message = {
        id: uuidv4(),
        role: 'system',
        content: 'Welcome to W3J Assistant! How can I help you today?',
        timestamp: new Date(),
      };

      // Add welcome message
      setMessages([welcomeMessage]);

      // If memory manager exists, clear messages for the current session
      if (memoryManager && currentSessionId) {
        await memoryManager.clearSessionMessages(currentSessionId);
        // Save welcome message to memory
        await memoryManager.saveMessage(welcomeMessage);
      }
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  }, [memoryManager, currentSessionId, setMessages]);

  return {
    // Chat state
    messages,
    isTyping,
    pendingMessage,
    streamingResponse,

    // Session management
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    updateSessionTitle,
    deleteSession,

    // Message actions
    sendMessage,
    deleteMessage,
    updatePendingMessage,
    
    // Conversation actions
    exportConversation,
    forkConversation,
    clearConversation,
    
    // Persona management
    activePersona,
    setActivePersona,
  };
};

export default useChat;
