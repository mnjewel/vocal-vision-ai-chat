
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthContext } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MemoryManager } from '@/services/MemoryManager';
import { Message } from '@/types/chat';

export interface Session {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages?: Message[];
}

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuthContext();

  // Local storage key for sessions
  const LOCAL_STORAGE_KEY = 'chat_sessions';
  
  // Fetch sessions from storage on load
  useEffect(() => {
    fetchSessions();
  }, [user?.id]);

  // Create fetch sessions method
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        // Get sessions from Supabase if logged in
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Map data to Session type
        const mappedSessions = data.map((session: any) => ({
          id: session.id,
          title: session.title,
          createdAt: new Date(session.created_at),
          updatedAt: new Date(session.updated_at),
        }));

        setSessions(mappedSessions);
        
        // Set current session to the most recent one, or null if no sessions exist
        if (mappedSessions.length > 0 && !currentSessionId) {
          setCurrentSessionId(mappedSessions[0].id);
        }
      } else {
        // Get sessions from local storage if not logged in
        const localSessions = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localSessions) {
          const parsedSessions = JSON.parse(localSessions);
          setSessions(parsedSessions);
          
          // Set current session to the most recent one, or null if no sessions exist
          if (parsedSessions.length > 0 && !currentSessionId) {
            setCurrentSessionId(parsedSessions[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // Fallback to local storage if Supabase fails
      try {
        const localSessions = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localSessions) {
          setSessions(JSON.parse(localSessions));
        }
      } catch (e) {
        console.error('Error loading from local storage:', e);
        setSessions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [currentSessionId, user]);

  // Create a new session
  const createNewSession = useCallback(async (): Promise<string | null> => {
    try {
      const sessionId = uuidv4();
      const now = new Date();
      const newSession = {
        id: sessionId,
        title: 'New Conversation',
        createdAt: now,
        updatedAt: now,
      };

      if (user) {
        try {
          // Store in Supabase if user is logged in
          const { error } = await supabase
            .from('chat_sessions')
            .insert({
              id: sessionId,
              user_id: user.id,
              title: 'New Conversation',
              created_at: now.toISOString(),
              updated_at: now.toISOString(),
            });

          if (error) {
            console.error('Error creating session:', error);
            // Fall back to local storage if Supabase fails
            handleLocalSessionCreation(newSession);
          }
        } catch (error) {
          console.error('Error creating session:', error);
          // Fall back to local storage if Supabase fails
          handleLocalSessionCreation(newSession);
        }
      } else {
        // Always store in local storage
        handleLocalSessionCreation(newSession);
      }

      // Update state
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(sessionId);
      
      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create new conversation');
      return null;
    }
  }, [user]);

  // Helper function to handle local storage session creation
  const handleLocalSessionCreation = (newSession: Session) => {
    try {
      const existingSessions = localStorage.getItem(LOCAL_STORAGE_KEY);
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.unshift(newSession);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving session to local storage:', error);
    }
  };

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      if (user) {
        // Delete from Supabase if logged in
        const { error } = await supabase
          .from('chat_sessions')
          .delete()
          .eq('id', sessionId);

        if (error) throw error;
      }

      // Always update local state and storage
      setSessions(prev => prev.filter(session => session.id !== sessionId));

      // Update local storage
      try {
        const existingSessions = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (existingSessions) {
          const sessions = JSON.parse(existingSessions);
          const updatedSessions = sessions.filter((s: Session) => s.id !== sessionId);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSessions));
        }
      } catch (error) {
        console.error('Error updating local storage:', error);
      }

      // If current session is deleted, set to most recent, or null if no sessions left
      if (currentSessionId === sessionId) {
        const updatedSessions = sessions.filter(session => session.id !== sessionId);
        setCurrentSessionId(updatedSessions.length > 0 ? updatedSessions[0].id : null);
      }

      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete conversation');
    }
  }, [currentSessionId, sessions, user]);

  // Update session title
  const updateSessionTitle = useCallback(async (sessionId: string, newTitle: string) => {
    try {
      const now = new Date();
      
      if (user) {
        // Update in Supabase if logged in
        const { error } = await supabase
          .from('chat_sessions')
          .update({
            title: newTitle,
            updated_at: now.toISOString(),
          })
          .eq('id', sessionId);

        if (error) throw error;
      }

      // Always update local state and storage
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId
            ? { ...session, title: newTitle, updatedAt: now }
            : session
        )
      );

      // Update local storage
      try {
        const existingSessions = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (existingSessions) {
          const sessions = JSON.parse(existingSessions);
          const updatedSessions = sessions.map((s: Session) =>
            s.id === sessionId ? { ...s, title: newTitle, updatedAt: now } : s
          );
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedSessions));
        }
      } catch (error) {
        console.error('Error updating local storage:', error);
      }

    } catch (error) {
      console.error('Error updating session title:', error);
      toast.error('Failed to update conversation title');
    }
  }, [user]);

  // Get current session
  const getCurrentSession = useCallback(() => {
    return sessions.find(session => session.id === currentSessionId) || null;
  }, [currentSessionId, sessions]);

  // Export conversation to a markdown file
  const exportConversation = useCallback((messages: Message[]) => {
    try {
      const currentSession = getCurrentSession();
      if (!currentSession) return;

      const title = currentSession.title || 'Conversation';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${title}-${timestamp}.md`;

      // Generate markdown content
      let markdownContent = `# ${title}\n\n`;
      markdownContent += `Exported: ${new Date().toLocaleString()}\n\n`;

      messages.forEach((message) => {
        if (message.role !== 'system') {
          const roleName = message.role === 'user' ? 'You' : 'AI';
          markdownContent += `## ${roleName} (${new Date(message.timestamp).toLocaleString()})\n\n`;
          markdownContent += `${message.content}\n\n`;
        }
      });

      // Create and download file
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Conversation exported to Markdown');
    } catch (error) {
      console.error('Error exporting conversation:', error);
      toast.error('Failed to export conversation');
    }
  }, [getCurrentSession]);

  // Fork conversation (create a copy)
  const forkConversation = useCallback(async (memoryManager: MemoryManager | null) => {
    try {
      if (!currentSessionId || !memoryManager) {
        throw new Error('No current session or memory manager');
      }

      // Create new session
      const newSessionId = await createNewSession();
      if (!newSessionId) {
        throw new Error('Failed to create new session');
      }

      // Load messages from current session
      const currentMessages = await memoryManager.loadSessionMessages(currentSessionId);
      
      // Create new memory manager and save messages to it
      const newMemoryManager = new MemoryManager(newSessionId);
      for (const message of currentMessages) {
        await newMemoryManager.saveMessage({
          ...message,
          id: uuidv4(), // Generate new message IDs
        });
      }

      // Update title to indicate it's a fork
      const currentSession = getCurrentSession();
      if (currentSession) {
        await updateSessionTitle(
          newSessionId,
          `Fork of ${currentSession.title}`
        );
      }

      // Switch to new session
      setCurrentSessionId(newSessionId);

      toast.success('Conversation forked successfully');
      return newSessionId;
    } catch (error) {
      console.error('Error forking conversation:', error);
      toast.error('Failed to fork conversation');
      return null;
    }
  }, [createNewSession, currentSessionId, getCurrentSession, updateSessionTitle]);

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    loading,
    createNewSession,
    deleteSession,
    updateSessionTitle,
    getCurrentSession,
    exportConversation,
    forkConversation,
  };
};

export default useSessions;
