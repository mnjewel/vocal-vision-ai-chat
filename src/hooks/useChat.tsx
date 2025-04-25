
import { useState, useCallback, useRef, useEffect } from 'react';

// Define message types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  model?: string;
  pending?: boolean;
  imageUrl?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Mock API response function - in a real app, this would be replaced with an actual API call
const mockApiResponse = (userMessage: string): Promise<string> => {
  return new Promise((resolve) => {
    const responses = [
      "I'm W3J Assistant, a modern AI helper. How can I assist you today?",
      "That's an interesting question. Let me think about that for a moment...",
      "Based on my knowledge, I can provide several insights on this topic.",
      "I understand what you're asking. Here's what I know about that.",
      "That's a great point! I'd like to add some additional context that might help.",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    // Simulate streaming with a delay
    setTimeout(() => resolve(randomResponse), 1500);
  });
};

// Generate unique IDs for messages
const generateId = () => Math.random().toString(36).substring(2, 9);

// Hook for managing chat state and interactions
export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string>('');
  
  // Initialize with a system message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: generateId(),
          role: 'system',
          content: 'Welcome to W3J Assistant! How can I help you today?',
          timestamp: new Date(),
        },
      ]);
    }
  }, []);
  
  // Create a new chat session
  const createNewSession = useCallback(() => {
    const newSessionId = generateId();
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(newSessionId);
    setMessages([
      {
        id: generateId(),
        role: 'system',
        content: 'Welcome to W3J Assistant! How can I help you today?',
        timestamp: new Date(),
      },
    ]);
    
    return newSessionId;
  }, []);
  
  // Get current active session
  const getCurrentSession = useCallback(() => {
    if (!currentSessionId) {
      const newSessionId = createNewSession();
      return sessions.find(s => s.id === newSessionId) || null;
    }
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [currentSessionId, sessions, createNewSession]);

  // Send a message to the assistant
  const sendMessage = useCallback(async (content: string, imageUrl?: string) => {
    if (!content.trim() && !imageUrl) return;
    
    // Add user message to the state
    const userMessageId = generateId();
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content,
      timestamp: new Date(),
      imageUrl,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // In a real app, this would be a call to an AI service API
      const response = await mockApiResponse(content);
      
      // Add assistant response to the state
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        model: 'W3J-AI-Model',
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Update session with the new messages
      if (currentSessionId) {
        setSessions((prev) =>
          prev.map((session) =>
            session.id === currentSessionId
              ? {
                  ...session,
                  messages: [...session.messages, userMessage, assistantMessage],
                  updatedAt: new Date(),
                  title: session.title === 'New Conversation' ? content.substring(0, 30) : session.title,
                }
              : session
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'system',
          content: 'Sorry, there was an error processing your request. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
      setPendingMessage('');
    }
  }, [currentSessionId]);

  // Update message content while typing (for drafts)
  const updatePendingMessage = useCallback((content: string) => {
    setPendingMessage(content);
  }, []);

  return {
    messages,
    isTyping,
    pendingMessage,
    sessions,
    currentSessionId,
    setCurrentSessionId,
    sendMessage,
    updatePendingMessage,
    createNewSession,
    getCurrentSession,
  };
};

export default useChat;
