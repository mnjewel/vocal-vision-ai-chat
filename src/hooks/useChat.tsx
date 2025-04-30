
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/AuthProvider';
import { createGroqChatCompletion } from '@/integrations/groq/service';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useSettingsStore } from '@/stores/settingsStore';

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

const generateId = () => uuidv4();

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string>('');
  
  const { user } = useAuthContext();
  const { autoSaveMessages } = useSettingsStore();

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
  
  const createNewSession = useCallback(async () => {
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
  
  const getCurrentSession = useCallback(() => {
    if (!currentSessionId) {
      return null;
    }
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [currentSessionId, sessions]);

  const deleteMessage = useCallback(async (id: string) => {
    try {
      setMessages((prev) => prev.filter(msg => msg.id !== id));
      
      if (user && currentSessionId && autoSaveMessages) {
        // Delete from database if logged in
        await supabase
          .from('messages')
          .delete()
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete message",
      });
    }
  }, [user, currentSessionId, autoSaveMessages]);

  const sendMessage = useCallback(async (content: string, imageUrl?: string, model: string = 'llama-3.3-70b-versatile') => {
    if (!content.trim() && !imageUrl) return;
    
    try {
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await createNewSession();
        if (!sessionId) {
          throw new Error("Failed to create session");
        }
      }
      
      const userMessageId = generateId();
      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        content,
        timestamp: new Date(),
        imageUrl,
      };
      
      setMessages((prev) => [...prev, userMessage]);
      
      setIsTyping(true);
      
      try {
        if (user && autoSaveMessages) {
          await supabase.from('messages').insert({
            id: userMessageId,
            session_id: sessionId,
            role: 'user',
            content: content
          });
        }
        
        const session = getCurrentSession();
        if (session?.title === 'New Conversation' && user && autoSaveMessages) {
          const truncatedTitle = content.substring(0, 30) + (content.length > 30 ? '...' : '');
          
          await supabase
            .from('chat_sessions')
            .update({ 
              title: truncatedTitle,
              updated_at: new Date().toISOString()
            })
            .eq('id', sessionId);
            
          setSessions(prev => prev.map(s => 
            s.id === sessionId 
              ? { ...s, title: truncatedTitle, updatedAt: new Date() }
              : s
          ));
        }
        
        // Update this to use createGroqChatCompletion
        const response = await createGroqChatCompletion({
          messages: messages
            .filter(m => m.role !== 'system' || messages.indexOf(m) === 0)
            .concat([userMessage])
            .map(m => ({ role: m.role, content: m.content })),
          model: model,
        });
        
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          model: model,
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
        
        if (user && autoSaveMessages) {
          await supabase.from('messages').insert({
            id: assistantMessage.id,
            session_id: sessionId,
            role: 'assistant',
            content: response.content,
            model: model
          });
        }
        
        if (sessionId && user && autoSaveMessages) {
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
  }, [currentSessionId, messages, user, createNewSession, getCurrentSession, autoSaveMessages]);

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
    deleteMessage,
  };
};

export default useChat;
