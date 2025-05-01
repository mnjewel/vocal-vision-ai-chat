import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { MemoryManager } from '@/services/MemoryManager';

export const useSessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Fetch sessions from Supabase
  const fetchSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load conversation history"
      });
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Create a new session
  const createNewSession = useCallback(async () => {
    const newSessionId = uuidv4();

    try {
      const { error } = await supabase.from('chat_sessions').insert({
        id: newSessionId,
        user_id: '00000000-0000-0000-0000-000000000000', // This should be the actual user ID
        title: 'New Conversation',
      });

      if (error) {
        throw error;
      }

      await fetchSessions();
      setCurrentSessionId(newSessionId);
      return newSessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create new conversation"
      });
      return null;
    }
  }, [fetchSessions]);

  // Get current session
  const getCurrentSession = useCallback(() => {
    return sessions.find(session => session.id === currentSessionId);
  }, [sessions, currentSessionId]);

  // Update session title
  const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      await fetchSessions();
    } catch (error) {
      console.error('Error updating session title:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update conversation title"
      });
    }
  }, [fetchSessions]);

  // Delete a session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      await fetchSessions();
      setCurrentSessionId(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete conversation"
      });
    }
  }, [fetchSessions]);

  // Export conversation
  const exportConversation = useCallback((messages: any[]) => {
    if (!messages || messages.length === 0) {
      toast({
        title: "Info",
        description: "No messages to export"
      });
      return;
    }

    // Format messages to markdown
    const markdown = messages.map(message => {
      const timestamp = new Date(message.timestamp).toLocaleString();
      return `**${message.role}** (${timestamp}):\n${message.content}\n\n`;
    }).join('');

    // Create a file and download it
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversation.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Fork conversation
  const forkConversation = async (memoryManager: MemoryManager | null): Promise<string | null> => {
    if (!memoryManager) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fork conversation"
      });
      return null;
    }

    try {
      // Create branch using memory manager
      const newSessionId = await memoryManager.createBranch();

      if (!newSessionId) {
        throw new Error("Failed to create branch");
      }

      // Update sessions list by fetching latest
      await fetchSessions();

      // Switch to new session
      setCurrentSessionId(newSessionId);

      toast({
        title: "Success",
        description: "Conversation forked successfully"
      });

      return newSessionId; // Ensure we return a string here
    } catch (error) {
      console.error('Error forking conversation:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fork conversation"
      });
      
      return null;
    }
  };

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
