
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession } from '@/types/chat';
import { handleError } from '@/utils/errorHandler';

export const useSessions = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Load user's sessions
  const loadSessions = useCallback(async () => {
    setIsLoading(true);

    try {
      // Get current user's session if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      // If authenticated, get user's sessions from Supabase
      if (user) {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Convert to ChatSession objects
        const formattedSessions: ChatSession[] = data.map((session: any) => ({
          id: session.id,
          title: session.title,
          messages: [], // We'll load messages only for the active session
          createdAt: new Date(session.created_at),
          updatedAt: new Date(session.updated_at)
        }));

        setSessions(formattedSessions);

        // Set current session to the first one or create a new one if none exists
        if (formattedSessions.length > 0 && !currentSessionId) {
          setCurrentSessionId(formattedSessions[0].id);
        } else if (formattedSessions.length === 0) {
          // Create a new session if none exists
          createNewSession();
        }
      } else {
        // If not authenticated, use local storage for sessions
        const storedSessions = localStorage.getItem('chat-sessions');
        
        if (storedSessions) {
          const parsedSessions: ChatSession[] = JSON.parse(storedSessions);
          setSessions(parsedSessions);
          
          // Set current session to the first one or create a new one if none exists
          if (parsedSessions.length > 0 && !currentSessionId) {
            setCurrentSessionId(parsedSessions[0].id);
          } else if (parsedSessions.length === 0) {
            // Create a new session if none exists
            createNewSession();
          }
        } else {
          // Create a new session if no saved sessions
          createNewSession();
        }
      }
    } catch (error) {
      handleError(error, 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Create a new session
  const createNewSession = useCallback(async () => {
    if (isCreating) return null;
    
    setIsCreating(true);
    let newSessionId = uuidv4();

    try {
      // Get current user's session if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Create new session in Supabase
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert({
            title: 'New Conversation',
            user_id: user.id
          })
          .select();

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          newSessionId = data[0].id;
        }
      }

      // Create new session object
      const newSession: ChatSession = {
        id: newSessionId,
        title: 'New Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Update state
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSessionId);

      // If not authenticated, update local storage
      if (!(await supabase.auth.getUser()).data.user) {
        const storedSessions = localStorage.getItem('chat-sessions');
        const existingSessions: ChatSession[] = storedSessions ? JSON.parse(storedSessions) : [];
        localStorage.setItem('chat-sessions', JSON.stringify([newSession, ...existingSessions]));
      }

      return newSessionId;
    } catch (error) {
      handleError(error, 'Failed to create new session');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [isCreating]);

  // Get current session
  const getCurrentSession = useCallback(() => {
    if (!currentSessionId) return null;
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [sessions, currentSessionId]);

  // Update session title
  const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
    try {
      // Update local state
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title, updatedAt: new Date() } : s
      ));

      // Get current user's session if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update in Supabase
        const { error } = await supabase
          .from('chat_sessions')
          .update({
            title,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);

        if (error) {
          throw error;
        }
      } else {
        // Update in local storage
        const storedSessions = localStorage.getItem('chat-sessions');
        if (storedSessions) {
          const existingSessions: ChatSession[] = JSON.parse(storedSessions);
          const updatedSessions = existingSessions.map(s => 
            s.id === sessionId ? { ...s, title, updatedAt: new Date() } : s
          );
          localStorage.setItem('chat-sessions', JSON.stringify(updatedSessions));
        }
      }
    } catch (error) {
      handleError(error, 'Failed to update session title');
    }
  }, []);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      // Get current user's session if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Delete from Supabase - messages will cascade delete due to foreign key
        const { error } = await supabase
          .from('chat_sessions')
          .delete()
          .eq('id', sessionId);

        if (error) {
          throw error;
        }
      }

      // Update state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If deleting current session, set to first remaining session or create a new one
      if (currentSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSessionId(remainingSessions[0].id);
        } else {
          createNewSession();
        }
      }

      // If not authenticated, update local storage
      if (!user) {
        const storedSessions = localStorage.getItem('chat-sessions');
        if (storedSessions) {
          const existingSessions: ChatSession[] = JSON.parse(storedSessions);
          const updatedSessions = existingSessions.filter(s => s.id !== sessionId);
          localStorage.setItem('chat-sessions', JSON.stringify(updatedSessions));
        }
      }
    } catch (error) {
      handleError(error, 'Failed to delete session');
    }
  }, [sessions, currentSessionId, createNewSession]);

  // Export conversation
  const exportConversation = useCallback((messages: Message[]) => {
    try {
      const session = getCurrentSession();
      if (!session) return;

      // Format messages as markdown
      const markdown = formatMessagesAsMarkdown(messages, session.title);
      
      // Create a blob and trigger download
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session.title.replace(/\s+/g, '-').toLowerCase()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      handleError(error, 'Failed to export conversation');
    }
  }, [getCurrentSession]);

  // Fork conversation
  const forkConversation = useCallback(async (memoryManager: any) => {
    try {
      if (!memoryManager) return null;
      
      // Use memory manager to create branch
      const newSessionId = await memoryManager.createBranch();
      
      if (!newSessionId) {
        throw new Error('Failed to create branch');
      }
      
      // Now load the sessions to update our state with the new branch
      await loadSessions();
      
      // Set the current session to the new branch
      setCurrentSessionId(newSessionId);
      
      return newSessionId;
    } catch (error) {
      handleError(error, 'Failed to fork conversation');
      return null;
    }
  }, [loadSessions]);

  // Helper function to format messages as markdown
  const formatMessagesAsMarkdown = (messages: Message[], title: string): string => {
    let markdown = `# ${title}\n\n`;
    
    for (const message of messages) {
      const role = message.role === 'assistant' ? 'AI' : message.role === 'user' ? 'You' : 'System';
      markdown += `## ${role}\n\n${message.content}\n\n`;
    }
    
    return markdown;
  };

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    isLoading,
    createNewSession,
    getCurrentSession,
    updateSessionTitle,
    deleteSession,
    exportConversation,
    forkConversation
  };
};

export default useSessions;
