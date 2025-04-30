
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/AuthProvider';
import { createGroqChatCompletion } from '@/integrations/groq/service';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useSettingsStore } from '@/stores/settingsStore';
import { MemoryManager } from '@/services/MemoryManager';
import { ModelManager } from '@/services/ModelManager';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  model?: string;
  pending?: boolean;
  imageUrl?: string;
  metadata?: {
    searchResults?: any[];
    codeOutput?: string;
    annotations?: string[];
  };
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
  const [activePersona, setActivePersona] = useState<string>('default');
  const [streamingResponse, setStreamingResponse] = useState<boolean>(false);
  
  const { user } = useAuthContext();
  const { autoSaveMessages } = useSettingsStore();
  
  // Create a ref to store the MemoryManager instance
  const memoryManagerRef = useRef<MemoryManager | null>(null);

  useEffect(() => {
    // Initialize or update the memory manager when session changes
    if (currentSessionId) {
      if (!memoryManagerRef.current || memoryManagerRef.current.sessionId !== currentSessionId) {
        memoryManagerRef.current = new MemoryManager(currentSessionId);
        
        // Load messages for the current session
        const loadSessionMessages = async () => {
          if (memoryManagerRef.current) {
            const sessionMessages = await memoryManagerRef.current.loadSessionMessages(currentSessionId);
            if (sessionMessages.length > 0) {
              setMessages(sessionMessages);
            }
          }
        };
        
        loadSessionMessages();
      }
    } else {
      // Create a new memory manager with a new session ID
      const newSessionId = generateId();
      memoryManagerRef.current = new MemoryManager(newSessionId);
    }
  }, [currentSessionId]);

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
      
      // Create a new memory manager
      memoryManagerRef.current = new MemoryManager(newSessionId);
      
      // Set default welcome message
      const welcomeMessage = {
        id: generateId(),
        role: 'system' as MessageRole,
        content: 'Welcome to W3J Assistant! How can I help you today?',
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
      
      // Save welcome message to memory
      memoryManagerRef.current.saveMessage(welcomeMessage);
      
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
      
      // Create a new memory manager
      memoryManagerRef.current = new MemoryManager(newSession.id);
      
      // Set default welcome message
      const welcomeMessage = {
        id: generateId(),
        role: 'system' as MessageRole,
        content: 'Welcome to W3J Assistant! How can I help you today?',
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
      
      // Save welcome message to memory
      memoryManagerRef.current.saveMessage(welcomeMessage);
      
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
      
      // Remove from memory manager
      if (memoryManagerRef.current) {
        memoryManagerRef.current.activeMessages = memoryManagerRef.current.activeMessages.filter(msg => msg.id !== id);
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

  const forkConversation = useCallback(async () => {
    if (!memoryManagerRef.current) return null;
    
    try {
      const newSessionId = await memoryManagerRef.current.createBranch();
      
      // Create a new session object
      const newSession: ChatSession = {
        id: newSessionId,
        title: `Fork of ${getCurrentSession()?.title || 'conversation'}`,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setSessions(prev => [newSession, ...prev]);
      
      toast({
        title: "Conversation forked",
        description: "A new branch has been created from this conversation",
      });
      
      return newSessionId;
    } catch (error) {
      console.error('Error forking conversation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fork conversation",
      });
      return null;
    }
  }, [getCurrentSession]);

  const exportConversation = useCallback(() => {
    try {
      // Format messages for export
      const exportData = {
        title: getCurrentSession()?.title || 'Conversation Export',
        timestamp: new Date().toISOString(),
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.toISOString()
        }))
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      toast({
        title: "Conversation exported",
        description: "Your conversation has been downloaded as a JSON file",
      });
    } catch (error) {
      console.error('Error exporting conversation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export conversation",
      });
    }
  }, [getCurrentSession, messages]);

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
      
      // Create user message
      const userMessageId = generateId();
      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        content,
        timestamp: new Date(),
        imageUrl,
      };
      
      // Add to UI
      setMessages((prev) => [...prev, userMessage]);
      
      // Save to memory
      if (memoryManagerRef.current) {
        await memoryManagerRef.current.saveMessage(userMessage);
      }
      
      setIsTyping(true);
      
      try {
        // Save to Supabase if logged in
        if (user && autoSaveMessages) {
          await supabase.from('messages').insert({
            id: userMessageId,
            session_id: sessionId,
            role: 'user',
            content: content
          });
        }
        
        // Update session title if new conversation
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
        
        // Get system prompt based on model and persona
        const systemPrompt = ModelManager.getSystemPrompt(model, activePersona);
        
        // Add system prompt to the context if it's not already there
        let contextMessages = [];
        if (memoryManagerRef.current) {
          // Get current context window
          contextMessages = memoryManagerRef.current.getContextWindow();
          
          // Check if we need to add a system prompt
          const hasSystemPrompt = contextMessages.some(m => m.role === 'system' && m !== messages[0]);
          
          if (!hasSystemPrompt) {
            const systemMessage: Message = {
              id: generateId(),
              role: 'system',
              content: systemPrompt,
              timestamp: new Date(),
            };
            
            // Add to memory but not to UI
            await memoryManagerRef.current.saveMessage(systemMessage);
            
            // Get updated context with system message
            contextMessages = memoryManagerRef.current.getContextWindow();
          }
        } else {
          // Fallback if memory manager isn't available
          contextMessages = [
            {
              id: generateId(),
              role: 'system',
              content: systemPrompt,
              timestamp: new Date(),
            },
            ...messages,
            userMessage
          ];
        }
        
        // Format messages for the API
        const apiMessages = contextMessages.map(m => ({ 
          role: m.role, 
          content: m.content 
        }));
        
        // Create pending AI message for streaming
        const assistantMessageId = generateId();
        const pendingAssistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          model: model,
          pending: true
        };
        
        // Add to UI to show typing indicator
        setMessages(prev => [...prev, pendingAssistantMessage]);
        setStreamingResponse(true);
        
        // Call Groq API
        const response = await createGroqChatCompletion({
          messages: apiMessages,
          model: model,
        });
        
        // Update assistant message with response
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          model: model,
        };
        
        // Update UI
        setMessages(prev => 
          prev.map(m => m.id === assistantMessageId ? assistantMessage : m)
        );
        
        // Save to memory
        if (memoryManagerRef.current) {
          await memoryManagerRef.current.saveMessage(assistantMessage);
        }
        
        // Save to Supabase if logged in
        if (user && autoSaveMessages) {
          await supabase.from('messages').insert({
            id: assistantMessage.id,
            session_id: sessionId,
            role: 'assistant',
            content: response.content,
            model: model
          });
        }
        
        // Update session timestamp
        if (sessionId && user && autoSaveMessages) {
          await supabase
            .from('chat_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', sessionId);
        }
      } catch (error) {
        console.error('Error in chat processing:', error);
        
        // Remove pending message if there was an error
        setMessages(prev => prev.filter(m => !m.pending));
        
        // Add error message
        setMessages(prev => [
          ...prev,
          {
            id: generateId(),
            role: 'system',
            content: 'Sorry, there was an error processing your request. Please check your connection and try again.',
            timestamp: new Date(),
          }
        ]);
        
        throw error;
      } finally {
        setStreamingResponse(false);
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
  }, [currentSessionId, messages, user, createNewSession, getCurrentSession, autoSaveMessages, activePersona]);

  const updatePendingMessage = useCallback((content: string) => {
    setPendingMessage(content);
  }, []);

  return {
    messages,
    isTyping,
    pendingMessage,
    sessions,
    currentSessionId,
    activePersona,
    streamingResponse,
    setCurrentSessionId,
    sendMessage,
    updatePendingMessage,
    createNewSession,
    getCurrentSession,
    deleteMessage,
    setActivePersona,
    forkConversation,
    exportConversation,
  };
};

export default useChat;
