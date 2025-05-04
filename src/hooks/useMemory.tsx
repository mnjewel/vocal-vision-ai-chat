
import { useState, useCallback, useEffect, useRef } from 'react';
import { MemoryManager } from '@/services/MemoryManager';
import { Message } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

interface UseMemoryProps {
  sessionId: string | null;
  onMessagesLoaded?: (messages: Message[]) => void;
}

export const useMemory = ({ sessionId, onMessagesLoaded }: UseMemoryProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [memorySnapshots, setMemorySnapshots] = useState<any[]>([]);
  const memoryManagerRef = useRef<MemoryManager | null>(null);

  // Initialize memory manager when session changes
  useEffect(() => {
    if (sessionId) {
      memoryManagerRef.current = new MemoryManager(sessionId);
      loadSessionData();
    } else {
      // Create a new memory manager with a new session ID
      const newSessionId = uuidv4();
      memoryManagerRef.current = new MemoryManager(newSessionId);
    }
  }, [sessionId]);

  // Load session data (messages)
  const loadSessionData = useCallback(async () => {
    if (!memoryManagerRef.current || !sessionId) return;
    
    setIsLoading(true);
    try {
      // Load messages
      const messages = await memoryManagerRef.current.loadSessionMessages(sessionId);
      
      // Notify parent component about loaded messages
      if (onMessagesLoaded) {
        onMessagesLoaded(messages);
      }
    } catch (error) {
      console.error('Error loading session data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, onMessagesLoaded]);

  // Save a message to memory
  const saveMessage = useCallback(async (message: Message) => {
    if (!memoryManagerRef.current) return;
    
    await memoryManagerRef.current.saveMessage(message);
  }, []);

  // Delete a message from memory
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!memoryManagerRef.current) return;
    
    await memoryManagerRef.current.deleteMessage(messageId);
  }, []);

  // Get context window for AI processing
  const getContextWindow = useCallback(() => {
    if (!memoryManagerRef.current) return [];
    
    return memoryManagerRef.current.getContextWindow();
  }, []);

  // Search through messages - this is a placeholder since MemoryManager doesn't have a searchMessages method
  const searchMessages = useCallback((query: string) => {
    if (!memoryManagerRef.current || !query.trim()) {
      setSearchResults([]);
      return [];
    }
    
    // Default implementation - just returns empty array
    setSearchResults([]);
    return [];
  }, []);

  // Get all active messages
  const getActiveMessages = useCallback(() => {
    if (!memoryManagerRef.current) return [];
    
    // Default implementation - return empty array since MemoryManager doesn't have activeMessages
    return [];
  }, []);

  return {
    isLoading,
    searchResults,
    branches,
    memorySnapshots,
    memoryManager: memoryManagerRef.current,
    saveMessage,
    deleteMessage,
    getContextWindow,
    searchMessages,
    getActiveMessages,
    loadSessionData
  };
};

export default useMemory;
