
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/AuthProvider';
import { createChatCompletion } from '@/integrations/openai/service';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

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

// Generate unique IDs for messages
const generateId = () => uuidv4();

// Hook for managing chat state and interactions
export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string>('');
  
  const { user } = useAuthContext();

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

  // Fetch user's chat sessions from database
  useEffect(() => {
    async function fetchSessions() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedSessions: ChatSession[] = data.map(session => ({
            id: session.id,
            title: session.title,
            messages: [],
            createdAt: new Date(session.created_at as string),
            updatedAt: new Date(session.updated_at as string),
          }));
          setSessions(formattedSessions);
        }
      } catch (error) {
        console.error('Error fetching chat sessions:', error);
      }
    }

    fetchSessions();
  }, [user]);
  
  // Create a new chat session
  const createNewSession = useCallback(async () => {
    // For non-authenticated users, just create a client-side session ID
    if (!user) {
      const newSessionId = uuidv4();
      const newSession: ChatSession = {
        id: newSessionId,
        title: 'New Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setSessions((prev) => [newSession, ...prev]);
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
    }

    try {
      const newSessionId = uuidv4();
      const newSession: ChatSession = {
        id: newSessionId,
        title: 'New Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Save to database
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          id: newSessionId,
          user_id: user.id,
          title: 'New Conversation',
        })
        .select();

      if (error) {
        console.error('Database error creating session:', error);
        throw error;
      }
      
      if (data && data[0]) {
        const dbSession = data[0];
        newSession.id = dbSession.id;
      }
      
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setMessages([
        {
          id: generateId(),
          role: 'system',
          content: 'Welcome to W3J Assistant! How can I help you today?',
          timestamp: new Date(),
        },
      ]);
      
      return newSession.id;
    } catch (error) {
      console.error('Error creating new session:', error);
      toast({
        variant: "destructive",
        title: "Failed to create new chat",
        description: "Please try again later",
      });
      return null;
    }
  }, [user]);
  
  // Get current active session
  const getCurrentSession = useCallback(() => {
    if (!currentSessionId) {
      return null;
    }
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [currentSessionId, sessions]);

  // Send a message to the assistant
  const sendMessage = useCallback(async (content: string, imageUrl?: string, model: string = 'gpt-3.5-turbo') => {
    if (!content.trim() && !imageUrl) return;
    
    try {
      // Create a new session if none exists
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await createNewSession();
        if (!sessionId) {
          throw new Error("Failed to create session");
        }
      }
      
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
        // Save user message to database if user is authenticated
        if (user) {
          await supabase.from('messages').insert({
            id: userMessageId,
            session_id: sessionId,
            role: 'user',
            content: content,
          });
        }
        
        // Update session title if it's a new conversation
        const session = getCurrentSession();
        if (session?.title === 'New Conversation' && user) {
          const truncatedTitle = content.substring(0, 30) + (content.length > 30 ? '...' : '');
          
          await supabase
            .from('chat_sessions')
            .update({
              title: truncatedTitle,
              updated_at: new Date().toISOString(),
            })
            .eq('id', sessionId);
            
          setSessions(prev => prev.map(s => 
            s.id === sessionId 
              ? { ...s, title: truncatedTitle, updatedAt: new Date() }
              : s
          ));
        }
        
        // Get completion from API
        const aiResponse = await createChatCompletion({
          messages: messages
            .filter(m => m.role !== 'system' || messages.indexOf(m) === 0) // Only include first system message
            .concat([userMessage])
            .map(m => ({ role: m.role, content: m.content })),
          model: model,
        });
        
        // Add assistant response to the state
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
          model: model,
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Save assistant message to database if user is authenticated
        if (user) {
          await supabase.from('messages').insert({
            id: assistantMessage.id,
            session_id: sessionId,
            role: 'assistant',
            content: aiResponse,
            model: model,
          });
        }
        
        // Update session
        if (sessionId && user) {
          await supabase
            .from('chat_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', sessionId);
        }
      } catch (error) {
        console.error('Error in chat processing:', error);
        throw error;
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'system',
          content: 'Sorry, there was an error processing your request. Please check your API key and try again.',
          timestamp: new Date(),
        },
      ]);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process your message",
      });
    } finally {
      setIsTyping(false);
      setPendingMessage('');
    }
  }, [currentSessionId, messages, user, createNewSession, getCurrentSession]);

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
