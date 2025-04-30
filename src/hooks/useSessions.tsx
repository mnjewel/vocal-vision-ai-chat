import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { ChatSession, Message } from '@/types/chat';
import { MemoryManager } from '@/services/MemoryManager';

const generateId = () => uuidv4();

export const useSessions = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { user } = useAuthContext();

  // Fetch sessions from Supabase
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
        toast.error('Failed to load chat sessions');
      }
    }

    fetchSessions();
  }, [user]);

  // Create a new session
  const createNewSession = useCallback(async (): Promise<string | null> => {
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
      
      return newSession.id;
    } catch (error) {
      console.error('Error creating new session:', error);
      toast.error('Failed to create new chat');
      return null;
    }
  }, [user]);

  // Get the current session
  const getCurrentSession = useCallback(() => {
    if (!currentSessionId) {
      return null;
    }
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [currentSessionId, sessions]);

  // Update session title
  const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
    try {
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { ...s, title, updatedAt: new Date() }
          : s
      ));
      
      if (user) {
        await supabase
          .from('chat_sessions')
          .update({ 
            title,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId);
      }
    } catch (error) {
      console.error('Error updating session title:', error);
      toast.error('Failed to update session title');
    }
  }, [user]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
      
      if (user) {
        await supabase
          .from('chat_sessions')
          .delete()
          .eq('id', sessionId);
      }
      
      toast.success('Session deleted');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  }, [currentSessionId, user]);

  // Export conversation
  const exportConversation = useCallback((messages: Message[]) => {
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
      
      toast.success('Conversation exported');
    } catch (error) {
      console.error('Error exporting conversation:', error);
      toast.error('Failed to export conversation');
    }
  }, [getCurrentSession]);

  // Fork conversation
  const forkConversation = useCallback(async (memoryManager: MemoryManager | null) => {
    if (!memoryManager) return null;
    
    try {
      const newSessionId = await memoryManager.createBranch();
      
      // Create a new session object
      const newSession: ChatSession = {
        id: newSessionId,
        title: `Fork of ${getCurrentSession()?.title || 'conversation'}`,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setSessions(prev => [newSession, ...prev]);
      
      toast.success('Conversation forked');
      
      return newSessionId;
    } catch (error) {
      console.error('Error forking conversation:', error);
      toast.error('Failed to fork conversation');
      return null;
    }
  }, [getCurrentSession]);

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    getCurrentSession,
    updateSessionTitle,
    deleteSession,
    exportConversation,
    forkConversation
  };
};

export default useSessions;
