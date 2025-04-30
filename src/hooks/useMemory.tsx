import { useState, useCallback, useEffect, useRef } from 'react';
import { MemoryManager } from '@/services/MemoryManager';
import { Message, MessageRole } from '@/hooks/useChat';
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
      if (!memoryManagerRef.current || memoryManagerRef.current.sessionId !== sessionId) {
        memoryManagerRef.current = new MemoryManager(sessionId);
        loadSessionData();
      }
    } else {
      // Create a new memory manager with a new session ID
      const newSessionId = uuidv4();
      memoryManagerRef.current = new MemoryManager(newSessionId);
    }
  }, [sessionId]);

  // Load session data (messages, branches, snapshots)
  const loadSessionData = useCallback(async () => {
    if (!memoryManagerRef.current || !sessionId) return;
    
    setIsLoading(true);
    try {
      // Load messages
      const messages = await memoryManagerRef.current.loadSessionMessages(sessionId);
      
      // Update branches and snapshots state
      setBranches(memoryManagerRef.current.branches);
      setMemorySnapshots(memoryManagerRef.current.memorySnapshots);
      
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
    
    // Update snapshots state if new ones were created
    setMemorySnapshots(memoryManagerRef.current.memorySnapshots);
  }, []);

  // Delete a message from memory
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!memoryManagerRef.current) return;
    
    await memoryManagerRef.current.deleteMessage(messageId);
    
    // Update snapshots state
    setMemorySnapshots(memoryManagerRef.current.memorySnapshots);
  }, []);

  // Get context window for AI processing
  const getContextWindow = useCallback(() => {
    if (!memoryManagerRef.current) return [];
    
    return memoryManagerRef.current.getContextWindow();
  }, []);

  // Create a new branch from the current conversation
  const createBranch = useCallback(async () => {
    if (!memoryManagerRef.current) return null;
    
    const newSessionId = await memoryManagerRef.current.createBranch();
    
    // Update branches state
    setBranches(memoryManagerRef.current.branches);
    
    return newSessionId;
  }, []);

  // Search through messages
  const searchMessages = useCallback((query: string) => {
    if (!memoryManagerRef.current || !query.trim()) {
      setSearchResults([]);
      return [];
    }
    
    const results = memoryManagerRef.current.searchMessages(query);
    setSearchResults(results);
    return results;
  }, []);

  // Create a memory snapshot manually
  const createMemorySnapshot = useCallback(async () => {
    if (!memoryManagerRef.current) return;
    
    await memoryManagerRef.current.createMemorySnapshot();
    
    // Update snapshots state
    setMemorySnapshots(memoryManagerRef.current.memorySnapshots);
  }, []);

  // Get all active messages
  const getActiveMessages = useCallback(() => {
    if (!memoryManagerRef.current) return [];
    
    return memoryManagerRef.current.activeMessages;
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
    createBranch,
    searchMessages,
    createMemorySnapshot,
    getActiveMessages,
    loadSessionData
  };
};

export default useMemory;
