
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/AuthProvider';
import { createGroqChatCompletion, GroqChatMessage } from '@/integrations/groq/service';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useSettingsStore } from '@/stores/settingsStore';
import { ModelManager } from '@/services/ModelManager';
import { MemoryManager } from '@/services/MemoryManager';
import { Message } from '@/types/chat';

const generateId = () => uuidv4();

interface UseMessagesProps {
  memoryManager: MemoryManager | null;
  currentSessionId: string | null;
  createNewSession: () => Promise<string | null>;
  activePersona: string;
}

export const useMessages = ({
  memoryManager,
  currentSessionId,
  createNewSession,
  activePersona
}: UseMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [pendingMessage, setPendingMessage] = useState<string>('');
  const [streamingResponse, setStreamingResponse] = useState<boolean>(false);

  const { user } = useAuthContext();
  const { autoSaveMessages } = useSettingsStore();

  // Initialize with welcome message if empty
  const initializeMessages = useCallback(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: generateId(),
        role: 'system',
        content: 'Welcome to W3J Assistant! How can I help you today?',
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);

      if (memoryManager) {
        memoryManager.saveMessage(welcomeMessage);
      }
    }
  }, [messages.length, memoryManager]);

  // Delete a message
  const deleteMessage = useCallback(async (id: string) => {
    try {
      setMessages((prev) => prev.filter(msg => msg.id !== id));

      // Delete from memory manager (which handles Supabase deletion)
      if (memoryManager) {
        await memoryManager.deleteMessage(id);
      }

      toast({
        description: "Message deleted"
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete message"
      });
    }
  }, [memoryManager]);

  // Send a message
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
      if (memoryManager) {
        await memoryManager.saveMessage(userMessage);
      }

      setIsTyping(true);

      try {
        // Save to Supabase if logged in
        if (user && autoSaveMessages && sessionId) {
          try {
            // Ensure sessionId is a string with proper type assertion and check
            if (typeof sessionId === 'string') {
              await supabase.from('messages').insert({
                id: userMessageId,
                session_id: sessionId, // Now we're sure this is a string
                role: 'user',
                content: content
              });
            } else {
              console.warn('Session ID is not a string, skipping database save');
            }
          } catch (error) {
            console.error('Failed to save message to Supabase:', error);
          }
        }

        // Get system prompt based on model and persona
        const systemPrompt = ModelManager.getSystemPrompt(activePersona);

        // Add system prompt to the context if it's not already there
        let contextMessages = [];
        if (memoryManager) {
          // Get current context window
          contextMessages = memoryManager.getContextWindow();

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
            await memoryManager.saveMessage(systemMessage);

            // Get updated context with system message
            contextMessages = memoryManager.getContextWindow();
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

        // Format messages for the API - Ensure role is one of the allowed types
        const apiMessages: GroqChatMessage[] = contextMessages.map(m => ({
          role: (m.role === 'user' || m.role === 'assistant' || m.role === 'system') 
                ? m.role as "user" | "assistant" | "system"
                : "user", // Type assertion to fix the issue
          content: m.content
        }));

        // Check if the last message in the API payload is a user message
        // This is critical to fix the "last message role must be 'user'" error
        if (apiMessages.length > 0 && apiMessages[apiMessages.length - 1].role !== 'user') {
          console.warn('Last message is not from user, adding user message to context');
          apiMessages.push({
            role: 'user',
            content: content
          });
        }

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
        if (memoryManager) {
          await memoryManager.saveMessage(assistantMessage);
        }

        // Save to Supabase if logged in and sessionId exists
        if (user && autoSaveMessages && sessionId) {
          try {
            // Ensure sessionId is a string with proper type check
            if (typeof sessionId === 'string') {
              await supabase.from('messages').insert({
                id: assistantMessage.id,
                session_id: sessionId,
                role: 'assistant',
                content: response.content
              });
            } else {
              console.warn('Session ID is not a string, skipping database save');
            }
          } catch (error) {
            console.error('Failed to save assistant message to Supabase:', error);
          }
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
        description: error instanceof Error ? error.message : "Failed to process your message"
      });
    } finally {
      setIsTyping(false);
      setPendingMessage('');
    }
  }, [currentSessionId, messages, user, createNewSession, autoSaveMessages, activePersona, memoryManager, setIsTyping, setMessages, setPendingMessage, setStreamingResponse]);

  // Update pending message
  const updatePendingMessage = useCallback((content: string) => {
    setPendingMessage(content);
  }, []);

  // Load messages for a session
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    if (!memoryManager) return;

    try {
      const sessionMessages = await memoryManager.loadSessionMessages(sessionId);
      if (sessionMessages.length > 0) {
        setMessages(sessionMessages);
      } else {
        initializeMessages();
      }
    } catch (error) {
      console.error('Error loading session messages:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load conversation history"
      });
      initializeMessages();
    }
  }, [memoryManager, initializeMessages]);

  return {
    messages,
    isTyping,
    pendingMessage,
    streamingResponse,
    sendMessage,
    deleteMessage,
    updatePendingMessage,
    loadSessionMessages,
    setMessages,
  };
};

export default useMessages;
